using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PurchaseReturnController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PurchaseReturnController(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task<int> GetOrCreateAccountAsync(string name, string type)
        {
            var acc = await _context.AccountHeads.FirstOrDefaultAsync(a => a.Name == name && a.ComId == 1);
            if (acc == null)
            {
                string categoryName = type switch { "Asset" or "Cash" or "Bank" => "Assets", "Liability" => "Liabilities", "Equity" => "Equity", "Income" => "Income", "Expense" => "Expense", _ => "Assets" };
                var category = await _context.AccountCategories.FirstOrDefaultAsync(c => c.Name == categoryName);
                if (category == null) { category = new AccountCategory { Name = categoryName, Code = "000" }; _context.AccountCategories.Add(category); await _context.SaveChangesAsync(); }
                acc = new AccountHead { Name = name, AccountType = type == "Cash" || type == "Bank" ? type : "General", AccountCategoryId = category.Id, ComId = 1, IsDefault = false };
                _context.AccountHeads.Add(acc);
                await _context.SaveChangesAsync();
            }
            return acc.Id;
        }

        private async Task LogProductHistory(int itemId, string type, string refNo, string desc, int? fromBranch = null, int? toBranch = null)
        {
            _context.ProductHistories.Add(new ProductHistory { InventoryItemId = itemId, EventDate = DateTime.UtcNow, EventType = type, ReferenceNo = refNo, Description = desc, FromBranchId = fromBranch, ToBranchId = toBranch, ComId = 1 });
        }

        [HttpGet]
        public async Task<IActionResult> GetPurchaseReturns(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<PurchaseReturn> query = _context.PurchaseReturns
                .Include(p => p.Details)
                .Where(p => !p.IsDelete);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                // Add search logic if needed, e.g., by Reason or related InvoiceNo
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.ReturnDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.PurchaseInvoiceId,
                    InvoiceNo = _context.PurchaseInvoices.Where(i => i.Id == p.PurchaseInvoiceId).Select(i => i.InvoiceNo).FirstOrDefault(),
                    SupplierName = (from i in _context.PurchaseInvoices
                                   join c in _context.Contacts on i.SupplierId equals c.Id
                                   where i.Id == p.PurchaseInvoiceId
                                   select c.Name).FirstOrDefault(),
                    p.ReturnDate,
                    p.TotalReturnAmount,
                    p.Reason,
                    ItemCount = p.Details.Count
                })
                .ToListAsync();

            return Ok(new
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPurchaseReturn(int id)
        {
            var pReturn = await _context.PurchaseReturns
                .Include(p => p.Details)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pReturn == null) return NotFound("Purchase Return not found.");

            var details = new List<object>();
            foreach (var detail in pReturn.Details)
            {
                var item = await _context.Inventory
                    .Include(i => i.MobileDevice)
                    .Include(i => i.Product)
                    .FirstOrDefaultAsync(i => i.Id == detail.InventoryItemId);

                details.Add(new
                {
                    detail.Id,
                    detail.InventoryItemId,
                    detail.RefundAmount,
                    DeviceName = item?.MobileDevice != null ? item.MobileDevice.Brand + " " + item.MobileDevice.ModelName : (item?.Product != null ? item.Product.Name : "N/A"),
                    IMEI = item?.IMEI1
                });
            }

            return Ok(new
            {
                pReturn.Id,
                pReturn.PurchaseInvoiceId,
                InvoiceNo = _context.PurchaseInvoices.Where(i => i.Id == pReturn.PurchaseInvoiceId).Select(i => i.InvoiceNo).FirstOrDefault(),
                pReturn.ReturnDate,
                pReturn.TotalReturnAmount,
                pReturn.Reason,
                Details = details
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreatePurchaseReturn(PurchaseReturnRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var items = await _context.Inventory
                    .Where(i => request.InventoryItemIds.Contains(i.Id) && !i.IsSold && !i.IsDelete)
                    .ToListAsync();

                if (items.Count != request.InventoryItemIds.Count)
                    return BadRequest("Some items are either sold, deleted, or not found.");

                // If a specific invoice was selected in UI, use it. Otherwise, use the invoice of the first item.
                int primaryInvoiceId = request.PurchaseInvoiceId > 0 ? request.PurchaseInvoiceId : (items[0].PurchaseInvoiceId ?? 0);
                var primaryInvoice = await _context.PurchaseInvoices.FindAsync(primaryInvoiceId);
                
                decimal totalRefundValue = items.Sum(i => i.CostPrice);

                var pReturn = new PurchaseReturn
                {
                    PurchaseInvoiceId = primaryInvoiceId,
                    ReturnDate = DateTime.UtcNow,
                    Reason = request.Reason,
                    TotalReturnAmount = totalRefundValue,
                    ComId = 1
                };

                // Group items by their original supplier to adjust balances correctly
                // In this system, one Return record usually belongs to one supplier session.
                // We'll process all items and adjust their respective supplier balances.
                
                foreach (var item in items)
                {
                    item.IsDelete = true;
                    pReturn.Details.Add(new PurchaseReturnDetail
                    {
                        InventoryItemId = item.Id,
                        RefundAmount = item.CostPrice,
                        ComId = 1
                    });

                    // Determine supplier and original invoice for this specific item
                    var originalInvoice = await _context.PurchaseInvoices.FindAsync(item.PurchaseInvoiceId);
                    if (originalInvoice != null)
                    {
                        var supplier = await _context.Contacts.FindAsync(originalInvoice.SupplierId);
                        if (supplier != null)
                        {
                            supplier.SupplierBalance -= item.CostPrice;
                            _context.ContactLedgers.Add(new ContactLedger
                            {
                                ContactId = supplier.Id,
                                TransactionDate = DateTime.UtcNow,
                                Description = $"RMA Item Return: {item.IMEI1} (Invoice: {originalInvoice.InvoiceNo})",
                                ReferenceNo = originalInvoice.InvoiceNo,
                                Debit = item.CostPrice,
                                Balance = supplier.SupplierBalance,
                                TransactionType = "PurchaseReturn",
                                ComId = 1
                            });
                        }
                        await LogProductHistory(item.Id, "PurchaseReturn", originalInvoice.InvoiceNo, $"Returned to supplier. Reason: {request.Reason}", item.BranchId, null);
                    }
                }

                _context.PurchaseReturns.Add(pReturn);

                // Accounting Entries
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset");
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability");

                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-RMA-" + DateTime.UtcNow.Ticks,
                    VoucherDate = DateTime.UtcNow,
                    ReferenceType = "PurchaseReturn",
                    ReferenceNo = primaryInvoice?.InvoiceNo ?? "RMA-GLOBAL",
                    ComId = 1
                };
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = totalRefundValue, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = 0, Credit = totalRefundValue, ComId = 1 });
                _context.JournalVouchers.Add(jv);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Purchase return processed successfully.", Id = pReturn.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePurchaseReturn(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var pReturn = await _context.PurchaseReturns
                    .Include(p => p.Details)
                    .FirstOrDefaultAsync(p => p.Id == id);

                if (pReturn == null) return NotFound("Purchase Return not found.");

                var invoice = await _context.PurchaseInvoices.FindAsync(pReturn.PurchaseInvoiceId);
                if (invoice == null) return BadRequest("Associated purchase invoice not found.");

                // Reverse Supplier Balance
                var supplier = await _context.Contacts.FindAsync(invoice.SupplierId);
                if (supplier != null)
                {
                    supplier.SupplierBalance += pReturn.TotalReturnAmount;
                    _context.ContactLedgers.Add(new ContactLedger
                    {
                        ContactId = supplier.Id,
                        TransactionDate = DateTime.UtcNow,
                        Description = $"REVERSED: Purchase Return for Invoice {invoice.InvoiceNo}",
                        ReferenceNo = invoice.InvoiceNo,
                        Credit = pReturn.TotalReturnAmount,
                        Balance = supplier.SupplierBalance,
                        TransactionType = "PurchaseReturnDelete",
                        ComId = 1
                    });
                }

                // Restore Inventory Items
                foreach (var detail in pReturn.Details)
                {
                    var item = await _context.Inventory.FindAsync(detail.InventoryItemId);
                    if (item != null)
                    {
                        item.IsDelete = false;
                        await LogProductHistory(item.Id, "PurchaseReturnDelete", invoice.InvoiceNo, "Purchase return deleted, item restored to stock");
                    }
                    detail.IsDelete = true;
                }

                pReturn.IsDelete = true;

                // Accounting reversal (Simplified: just add a reversing JV)
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset");
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability");

                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-PR-DEL-" + DateTime.UtcNow.Ticks,
                    VoucherDate = DateTime.UtcNow,
                    ReferenceType = "PurchaseReturnDelete",
                    ReferenceNo = invoice.InvoiceNo,
                    ComId = 1
                };
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = pReturn.TotalReturnAmount, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = pReturn.TotalReturnAmount, ComId = 1 });
                _context.JournalVouchers.Add(jv);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Purchase return deleted and inventory restored." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
    }
}
