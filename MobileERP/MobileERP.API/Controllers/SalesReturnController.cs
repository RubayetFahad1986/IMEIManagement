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
    public class SalesReturnController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SalesReturnController(ApplicationDbContext context)
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
        public async Task<IActionResult> GetReturns(int page = 1, int pageSize = 10)
        {
            IQueryable<SalesReturn> query = _context.SalesReturns
                .Include(r => r.Details)
                .Where(r => !r.IsDelete);

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(r => r.ReturnDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new
                {
                    r.Id,
                    r.ReturnDate,
                    r.TotalReturnAmount,
                    r.Reason,
                    InvoiceNo = _context.SalesInvoices.Where(i => i.Id == r.SalesInvoiceId).Select(i => i.InvoiceNo).FirstOrDefault(),
                    CustomerName = (from i in _context.SalesInvoices
                                   join c in _context.Contacts on i.CustomerId equals c.Id
                                   where i.Id == r.SalesInvoiceId
                                   select c.Name).FirstOrDefault(),
                    ItemCount = r.Details.Count
                })
                .ToListAsync();

            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetReturn(int id)
        {
            var sReturn = await _context.SalesReturns
                .Include(r => r.Details)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (sReturn == null) return NotFound();

            var details = new List<object>();
            foreach (var d in sReturn.Details)
            {
                var item = await _context.Inventory
                    .Include(i => i.MobileDevice)
                    .Include(i => i.Product)
                    .FirstOrDefaultAsync(i => i.Id == d.InventoryItemId);

                details.Add(new
                {
                    d.Id,
                    d.InventoryItemId,
                    d.RefundAmount,
                    DeviceName = item?.MobileDevice != null ? item.MobileDevice.Brand + " " + item.MobileDevice.ModelName : (item?.Product != null ? item.Product.Name : "Unknown"),
                    IMEI = item?.IMEI1
                });
            }

            return Ok(new
            {
                sReturn.Id,
                sReturn.ReturnDate,
                sReturn.TotalReturnAmount,
                sReturn.Reason,
                InvoiceNo = _context.SalesInvoices.Where(i => i.Id == sReturn.SalesInvoiceId).Select(i => i.InvoiceNo).FirstOrDefault(),
                Details = details
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateReturn(SalesReturnRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoice = await _context.SalesInvoices.FindAsync(request.SalesInvoiceId);
                if (invoice == null) return BadRequest("Invoice not found.");

                var itemsToReturn = await _context.Inventory
                    .Where(i => request.InventoryItemIds.Contains(i.Id) && i.IsSold)
                    .ToListAsync();

                if (itemsToReturn.Count != request.InventoryItemIds.Count)
                    return BadRequest("Some items were not sold or not found.");

                decimal totalRefund = 0;
                var sReturn = new SalesReturn
                {
                    SalesInvoiceId = request.SalesInvoiceId,
                    ReturnDate = DateTime.UtcNow,
                    Reason = request.Reason,
                    ComId = 1
                };

                foreach (var item in itemsToReturn)
                {
                    // Find original sale price for this item in this invoice
                    var saleDetail = await _context.SalesDetails
                        .FirstOrDefaultAsync(d => d.SalesInvoiceId == request.SalesInvoiceId && d.InventoryItemId == item.Id);
                    
                    decimal itemRefund = saleDetail?.UnitPrice ?? item.CurrentSalePrice;
                    totalRefund += itemRefund;

                    item.IsSold = false; // Item is back in stock
                    sReturn.Details.Add(new SalesReturnDetail
                    {
                        InventoryItemId = item.Id,
                        RefundAmount = itemRefund,
                        ComId = 1
                    });

                    await LogProductHistory(item.Id, "SalesReturn", invoice.InvoiceNo, $"Returned by customer. Reason: {request.Reason}", null, item.BranchId);
                }

                sReturn.TotalReturnAmount = totalRefund;
                _context.SalesReturns.Add(sReturn);

                // Update Customer Balance
                if (invoice.CustomerId != null)
                {
                    var customer = await _context.Contacts.FindAsync(invoice.CustomerId);
                    if (customer != null)
                    {
                        customer.CustomerBalance -= totalRefund;
                        _context.ContactLedgers.Add(new ContactLedger
                        {
                            ContactId = customer.Id,
                            TransactionDate = DateTime.UtcNow,
                            Description = $"Sales Return for Invoice {invoice.InvoiceNo}",
                            ReferenceNo = invoice.InvoiceNo,
                            Debit = 0,
                            Credit = totalRefund,
                            Balance = customer.CustomerBalance,
                            TransactionType = "SalesReturn",
                            ComId = 1
                        });
                    }
                }

                // Accounting
                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset");
                int salesAccId = await GetOrCreateAccountAsync("Sales Revenue", "Income");

                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-SR-" + DateTime.UtcNow.Ticks,
                    VoucherDate = DateTime.UtcNow,
                    ReferenceType = "SalesReturn",
                    ReferenceNo = invoice.InvoiceNo,
                    ComId = 1
                };
                jv.Entries.Add(new JournalEntry { AccountHeadId = salesAccId, Debit = totalRefund, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = totalRefund, ComId = 1 });
                _context.JournalVouchers.Add(jv);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Sales return processed.", Id = sReturn.Id });
            }
            catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReturn(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var sReturn = await _context.SalesReturns.Include(r => r.Details).FirstOrDefaultAsync(r => r.Id == id);
                if (sReturn == null) return NotFound();

                var invoice = await _context.SalesInvoices.FindAsync(sReturn.SalesInvoiceId);

                foreach (var detail in sReturn.Details)
                {
                    var item = await _context.Inventory.FindAsync(detail.InventoryItemId);
                    if (item != null)
                    {
                        item.IsSold = true;
                        await LogProductHistory(item.Id, "SalesReturnDelete", invoice?.InvoiceNo ?? "N/A", "Sales return deleted, item marked as sold again");
                    }
                    detail.IsDelete = true;
                }

                if (invoice?.CustomerId != null)
                {
                    var customer = await _context.Contacts.FindAsync(invoice.CustomerId);
                    if (customer != null)
                    {
                        customer.CustomerBalance += sReturn.TotalReturnAmount;
                        // Mark the original ledger entry as deleted to hide it
                        var oldLedgers = await _context.ContactLedgers
                            .Where(l => l.ReferenceNo == invoice.InvoiceNo && l.ContactId == customer.Id && (l.TransactionType == "SalesReturn" || l.TransactionType == "SalesReturnDelete") && !l.IsDelete)
                            .ToListAsync();
                        foreach(var l in oldLedgers) l.IsDelete = true;
                    }
                }

                // Find and delete related Journal Voucher
                var jv = await _context.JournalVouchers.Include(v => v.Entries).FirstOrDefaultAsync(j => j.ReferenceNo == invoice.InvoiceNo && j.ReferenceType == "SalesReturn");
                if (jv != null)
                {
                    jv.IsDelete = true;
                    foreach (var entry in jv.Entries) entry.IsDelete = true;
                }

                sReturn.IsDelete = true;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { Message = "Return deleted and inventory corrected." });
            }
            catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }
    }
}
