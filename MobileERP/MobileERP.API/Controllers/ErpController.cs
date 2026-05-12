using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ErpController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ErpController(ApplicationDbContext context)
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

        [HttpPost("purchase")]
        public async Task<IActionResult> CreatePurchase(PurchaseRequest request)
        {
            if (request.Items == null || !request.Items.Any()) return BadRequest("No items in purchase request.");
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(request.InvoiceNo)) request.InvoiceNo = "PUR-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + (await _context.PurchaseInvoices.CountAsync() + 1).ToString("D4");
                else if (await _context.PurchaseInvoices.AnyAsync(p => p.InvoiceNo == request.InvoiceNo && p.ComId == 1)) return BadRequest($"Duplicate Purchase Invoice Number: {request.InvoiceNo}");
                var requestImeis = request.Items.SelectMany(i => i.ImeiItems.Select(im => im.IMEI1)).ToList();
                if (requestImeis.Count != requestImeis.Distinct().Count()) return BadRequest("Duplicate IMEIs found in the same purchase request.");
                var existingImeis = await _context.Inventory.Where(i => requestImeis.Contains(i.IMEI1) && !i.IsDelete).Select(i => i.IMEI1).ToListAsync();
                if (existingImeis.Any()) return BadRequest($"The following IMEIs already exist in inventory: {string.Join(", ", existingImeis)}");
                var invoice = new PurchaseInvoice { InvoiceNo = request.InvoiceNo, PurchaseDate = DateTime.UtcNow, SupplierId = request.SupplierId, PaidAmount = request.PaidAmount, ComId = 1, CreateDate = DateTime.UtcNow, IsDelete = false };
                decimal totalCost = 0; var inventoryItems = new List<InventoryItem>();
                foreach (var item in request.Items)
                {
                    totalCost += item.CostPrice * item.ImeiItems.Count;
                    var detail = new PurchaseDetail { MobileDeviceId = item.MobileDeviceId, CostPrice = item.CostPrice, SalePrice = item.SalePrice, ComId = 1 };
                    
                    foreach(var imei in item.ImeiItems)
                    {
                        detail.ImeiItems.Add(new ImeiItem { IMEI1 = imei.IMEI1, IMEI2 = imei.IMEI2, SerialNumber = imei.SerialNumber, ComId = 1 });
                        inventoryItems.Add(new InventoryItem 
                        { 
                            MobileDeviceId = item.MobileDeviceId, 
                            IMEI1 = imei.IMEI1, 
                            IMEI2 = imei.IMEI2, 
                            CostPrice = item.CostPrice, 
                            CurrentSalePrice = item.SalePrice, 
                            CommissionAmount = item.CommissionAmount, 
                            IsSold = false, 
                            BranchId = 1, 
                            ComId = 1, 
                            Condition = item.Condition ?? "New",
                            BoxStatus = item.BoxStatus ?? "Intact",
                            IsOfficial = item.IsOfficial,
                            WarrantyMonths = item.WarrantyMonths,
                            WarrantyExpiryDate = item.WarrantyMonths > 0 ? DateTime.UtcNow.AddMonths(item.WarrantyMonths) : null,
                            CreateDate = DateTime.UtcNow 
                        });
                    }
                    invoice.Details.Add(detail);
                }
                invoice.TotalAmount = totalCost; invoice.DueAmount = totalCost - request.PaidAmount;
                _context.PurchaseInvoices.Add(invoice); _context.Inventory.AddRange(inventoryItems); await _context.SaveChangesAsync();
                foreach (var invItem in inventoryItems) await LogProductHistory(invItem.Id, "Purchase", invoice.InvoiceNo, $"Purchased from supplier ID {request.SupplierId}", null, 1);
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset"); int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability"); int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");
                var jv = new JournalVoucher { VoucherNo = "JV-PUR-" + invoice.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "Purchase", ReferenceNo = invoice.InvoiceNo, ComId = 1 };
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = totalCost, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = totalCost, ComId = 1 });
                if (request.PaidAmount > 0) { jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.PaidAmount, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = 0, Credit = request.PaidAmount, ComId = 1 }); }
                _context.JournalVouchers.Add(jv);
                var contact = await _context.Contacts.FindAsync(request.SupplierId);
                if (contact != null) { contact.SupplierBalance += invoice.DueAmount; _context.ContactLedgers.Add(new ContactLedger { ContactId = contact.Id, TransactionDate = DateTime.UtcNow, Description = $"Purchase Invoice {invoice.InvoiceNo}", ReferenceNo = invoice.InvoiceNo, Credit = totalCost, Debit = request.PaidAmount, Balance = contact.SupplierBalance, TransactionType = "Purchase", ComId = 1 }); }
                await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Purchase recorded successfully.", InvoiceId = invoice.Id });
            } catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(new { Message = "Critical error saving purchase.", Error = ex.Message }); }
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale(SalesRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(request.InvoiceNo)) request.InvoiceNo = "SAL-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + (await _context.SalesInvoices.CountAsync() + 1).ToString("D4");
                else if (await _context.SalesInvoices.AnyAsync(s => s.InvoiceNo == request.InvoiceNo && s.ComId == 1)) return BadRequest("Duplicate Sales Invoice Number.");
                var itemIds = request.Items.Select(i => i.InventoryItemId).ToList();
                var items = await _context.Inventory.Where(i => itemIds.Contains(i.Id) && !i.IsSold).ToListAsync();
                if (items.Count != request.Items.Count) return BadRequest("Items already sold or not found.");
                decimal totalExchangeCredit = 0;
                if (request.IsExchange && request.ReturningInventoryItemIds.Any())
                {
                    var returningItems = await _context.Inventory.Where(i => request.ReturningInventoryItemIds.Contains(i.Id)).ToListAsync();
                    foreach (var rItem in returningItems) { rItem.IsSold = false; totalExchangeCredit += request.ExchangeValue / returningItems.Count; await LogProductHistory(rItem.Id, "ExchangeReturn", "EXC-" + DateTime.UtcNow.Ticks, "Returned via exchange"); }
                }
                var invoice = new SalesInvoice { InvoiceNo = "SAL-" + DateTime.UtcNow.Ticks, SalesDate = DateTime.UtcNow, CustomerId = request.CustomerId, SalesPersonId = request.SalesPersonId, Discount = request.Discount, PaidAmount = request.PaidAmount, ComId = 1 };
                decimal subtotal = 0, totalCOGS = 0;
                foreach (var itemReq in request.Items)
                {
                    var item = items.First(i => i.Id == itemReq.InventoryItemId);
                    subtotal += item.CurrentSalePrice; totalCOGS += item.CostPrice; item.IsSold = true; item.WarrantyExpiryDate = DateTime.UtcNow.AddMonths(itemReq.WarrantyMonths);
                    invoice.Details.Add(new SalesDetail { InventoryItemId = item.Id, UnitPrice = item.CurrentSalePrice, CostPrice = item.CostPrice, CommissionAmount = item.CommissionAmount, WarrantyMonths = itemReq.WarrantyMonths, ComId = 1 });
                    await LogProductHistory(item.Id, "Sale", invoice.InvoiceNo, $"Sold to contact ID {request.CustomerId}", item.BranchId, null);
                }
                invoice.SubTotal = subtotal; invoice.NetTotal = subtotal - request.Discount - totalExchangeCredit; invoice.ChangeAmount = Math.Max(0, request.PaidAmount - invoice.NetTotal);
                _context.SalesInvoices.Add(invoice); await _context.SaveChangesAsync();
                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset"); int salesAccId = await GetOrCreateAccountAsync("Sales Revenue", "Income"); int cogsAccId = await GetOrCreateAccountAsync("Cost of Goods Sold", "Expense"); int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset"); int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");
                var jv = new JournalVoucher { VoucherNo = "JV-SAL-" + invoice.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "Sale", ReferenceNo = invoice.InvoiceNo, ComId = 1 };
                jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = invoice.NetTotal, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = salesAccId, Debit = 0, Credit = subtotal - request.Discount, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = cogsAccId, Debit = totalCOGS, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = 0, Credit = totalCOGS, ComId = 1 });
                if (request.PaidAmount > 0) { decimal actualPaid = Math.Min(request.PaidAmount, invoice.NetTotal); jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = actualPaid, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = actualPaid, ComId = 1 }); }
                _context.JournalVouchers.Add(jv);
                if (request.CustomerId.HasValue)
                {
                    var contact = await _context.Contacts.FindAsync(request.CustomerId.Value);
                    if (contact != null) { decimal due = invoice.NetTotal - Math.Min(request.PaidAmount, invoice.NetTotal); contact.CustomerBalance += due; _context.ContactLedgers.Add(new ContactLedger { ContactId = contact.Id, TransactionDate = DateTime.UtcNow, Description = $"Sales Invoice {invoice.InvoiceNo}", ReferenceNo = invoice.InvoiceNo, Debit = invoice.NetTotal, Credit = Math.Min(request.PaidAmount, invoice.NetTotal), Balance = contact.CustomerBalance, TransactionType = "Sale", ComId = 1 }); }
                }
                await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Sale recorded.", InvoiceId = invoice.Id });
            } catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpGet("inventory")] public async Task<IActionResult> GetInventory(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<InventoryItem> query = _context.Inventory.Include(i => i.MobileDevice).Where(i => !i.IsDelete);
            if (!string.IsNullOrEmpty(search)) { search = search.ToLower(); query = query.Where(i => i.IMEI1.ToLower().Contains(search) || i.IMEI2.ToLower().Contains(search) || (i.MobileDevice != null && i.MobileDevice.ModelName.ToLower().Contains(search)) || (i.MobileDevice != null && i.MobileDevice.Brand.ToLower().Contains(search))); }
            
            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(i => i.CreateDate).Skip((page - 1) * pageSize).Take(pageSize).Select(i => new {
                i.Id,
                i.IMEI1,
                i.IMEI2,
                i.IsSold,
                i.WarrantyExpiryDate,
                DeviceName = i.MobileDevice != null ? i.MobileDevice.Brand + " " + i.MobileDevice.ModelName : "N/A",
                PurchaseInfo = _context.ProductHistories.Where(h => h.InventoryItemId == i.Id && h.EventType == "Purchase").Select(h => new { h.EventDate, h.ReferenceNo }).FirstOrDefault(),
                LastActivity = _context.ProductHistories.Where(h => h.InventoryItemId == i.Id).OrderByDescending(h => h.EventDate).FirstOrDefault()
            }).ToListAsync();

            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }
        
        [HttpGet("sales")] public async Task<IActionResult> GetSales(int page = 1, int pageSize = 10, string? search = null) { IQueryable<SalesInvoice> query = _context.SalesInvoices; if (!string.IsNullOrEmpty(search)) { search = search.ToLower(); query = query.Where(s => s.InvoiceNo.ToLower().Contains(search)); } int totalCount = await query.CountAsync(); var items = await query.OrderByDescending(s => s.SalesDate).Skip((page - 1) * pageSize).Take(pageSize).Select(s => new { s.Id, s.InvoiceNo, s.SalesDate, CustomerName = _context.Contacts.Where(c => c.Id == s.CustomerId).Select(c => c.Name).FirstOrDefault(), s.NetTotal, s.PaidAmount, s.ChangeAmount }).ToListAsync(); return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) }); }
        [HttpGet("purchases")] public async Task<IActionResult> GetPurchases(int page = 1, int pageSize = 10, string? search = null) { IQueryable<PurchaseInvoice> query = _context.PurchaseInvoices.Where(p => !p.IsDelete); if (!string.IsNullOrEmpty(search)) { search = search.ToLower(); query = query.Where(p => p.InvoiceNo.ToLower().Contains(search)); } int totalCount = await query.CountAsync(); var items = await query.OrderByDescending(p => p.PurchaseDate).Skip((page - 1) * pageSize).Take(pageSize).Select(p => new { p.Id, p.InvoiceNo, p.PurchaseDate, SupplierName = _context.Contacts.Where(c => c.Id == p.SupplierId).Select(c => c.Name).FirstOrDefault(), p.TotalAmount, p.PaidAmount, p.DueAmount }).ToListAsync(); return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) }); }
        [HttpGet("sales/{id}")] public async Task<IActionResult> GetSale(int id) { var sale = await _context.SalesInvoices.Include(s => s.Details).ThenInclude(d => d.InventoryItem).ThenInclude(i => i.MobileDevice).FirstOrDefaultAsync(s => s.Id == id); if (sale == null) return NotFound(); var customer = await _context.Contacts.FindAsync(sale.CustomerId); return Ok(new { Sale = sale, Customer = customer }); }
        [HttpGet("purchases/{id}")] public async Task<IActionResult> GetPurchase(int id) { var purchase = await _context.PurchaseInvoices.Include(p => p.Details).ThenInclude(d => d.MobileDevice).FirstOrDefaultAsync(p => p.Id == id); if (purchase == null) return NotFound(); var supplier = await _context.Contacts.FindAsync(purchase.SupplierId); return Ok(new { Purchase = purchase, Supplier = supplier }); }
        [HttpGet("product-history/{itemId}")] public async Task<IActionResult> GetProductHistory(int itemId) => Ok(await _context.ProductHistories.Where(h => h.InventoryItemId == itemId).OrderByDescending(h => h.EventDate).ToListAsync());
        [HttpGet("staff")] public async Task<IActionResult> GetStaff() => Ok(await _context.Employees.OrderBy(e => e.Name).ToListAsync());
        
        [HttpPost("stolen-report")] public async Task<IActionResult> ReportStolen(StolenReportRequest request) { string claimId = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(); while (await _context.StolenDeviceReports.AnyAsync(r => r.ClaimId == claimId)) claimId = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(); var report = new StolenDeviceReport { ClaimId = claimId, IMEI1 = request.IMEI1, IMEI2 = request.IMEI2, BrandModel = request.BrandModel, ReporterName = request.ReporterName, ReporterPhone = request.ReporterPhone, ReporterEmail = request.ReporterEmail, PoliceStation = request.PoliceStation, IsVerified = false, ReportedByComId = 1 }; _context.StolenDeviceReports.Add(report); await _context.SaveChangesAsync(); return Ok(new { Message = "Stolen device reported.", ClaimId = report.ClaimId }); }
        [HttpGet("stolen-check/{imei}")] public async Task<IActionResult> CheckStolen(string imei) { var report = await _context.StolenDeviceReports.FirstOrDefaultAsync(r => r.IMEI1 == imei || r.IMEI2 == imei); if (report == null) return Ok(new { IsStolen = false }); return Ok(new { IsStolen = true, report.BrandModel, report.IsVerified, report.ReporterPhone, Message = report.IsVerified ? "WARNING: STOLEN." : "CAUTION: Reported." }); }

        [HttpPut("purchases/{id}")]
        public async Task<IActionResult> UpdatePurchase(int id, PurchaseRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var oldPurchase = await _context.PurchaseInvoices.Include(p => p.Details).ThenInclude(d => d.ImeiItems).FirstOrDefaultAsync(p => p.Id == id && p.ComId == 1);
                if (oldPurchase == null) return NotFound("Purchase not found.");

                var oldImeis = oldPurchase.Details.SelectMany(d => d.ImeiItems.Select(im => im.IMEI1)).ToList();
                var soldItems = await _context.Inventory.AnyAsync(i => oldImeis.Contains(i.IMEI1!) && i.IsSold && !i.IsDelete);
                if (soldItems) return BadRequest("Cannot edit purchase. Some items are already sold.");

                var inventoryItems = await _context.Inventory.Where(i => oldImeis.Contains(i.IMEI1!) && !i.IsDelete).ToListAsync();
                foreach (var item in inventoryItems) item.IsDelete = true;

                var supplier = await _context.Contacts.FindAsync(oldPurchase.SupplierId);
                if (supplier != null)
                {
                    supplier.SupplierBalance -= oldPurchase.DueAmount;
                    _context.ContactLedgers.Add(new ContactLedger { ContactId = supplier.Id, TransactionDate = DateTime.UtcNow, Description = $"REVERSED (Edit): Purchase Invoice {oldPurchase.InvoiceNo}", ReferenceNo = oldPurchase.InvoiceNo, Credit = -oldPurchase.TotalAmount, Debit = -oldPurchase.PaidAmount, Balance = supplier.SupplierBalance, TransactionType = "PurchaseEditReverse", ComId = 1 });
                }

                var oldJv = await _context.JournalVouchers.FirstOrDefaultAsync(j => j.ReferenceNo == oldPurchase.InvoiceNo && j.ReferenceType == "Purchase");
                if (oldJv != null) _context.JournalVouchers.Remove(oldJv);

                _context.PurchaseInvoices.Remove(oldPurchase);
                await _context.SaveChangesAsync();

                if (string.IsNullOrWhiteSpace(request.InvoiceNo)) request.InvoiceNo = oldPurchase.InvoiceNo;
                var newImeis = request.Items.SelectMany(i => i.ImeiItems.Select(im => im.IMEI1)).ToList();
                var existingImeis = await _context.Inventory.Where(i => newImeis.Contains(i.IMEI1) && !i.IsDelete).Select(i => i.IMEI1).ToListAsync();
                if (existingImeis.Any()) return BadRequest($"IMEIs already exist: {string.Join(", ", existingImeis)}");

                var invoice = new PurchaseInvoice { InvoiceNo = request.InvoiceNo, PurchaseDate = DateTime.UtcNow, SupplierId = request.SupplierId, PaidAmount = request.PaidAmount, ComId = 1, CreateDate = DateTime.UtcNow, IsDelete = false };
                decimal totalCost = 0; var newInventoryItems = new List<InventoryItem>();
                foreach (var item in request.Items)
                {
                    totalCost += item.CostPrice * item.ImeiItems.Count;
                    var detail = new PurchaseDetail { MobileDeviceId = item.MobileDeviceId, CostPrice = item.CostPrice, SalePrice = item.SalePrice, ComId = 1 };
                    foreach (var imei in item.ImeiItems)
                    {
                        detail.ImeiItems.Add(new ImeiItem { IMEI1 = imei.IMEI1, IMEI2 = imei.IMEI2, SerialNumber = imei.SerialNumber, ComId = 1 });
                        newInventoryItems.Add(new InventoryItem { MobileDeviceId = item.MobileDeviceId, IMEI1 = imei.IMEI1, IMEI2 = imei.IMEI2, CostPrice = item.CostPrice, CurrentSalePrice = item.SalePrice, CommissionAmount = item.CommissionAmount, IsSold = false, BranchId = 1, ComId = 1, CreateDate = DateTime.UtcNow });
                    }
                    invoice.Details.Add(detail);
                }
                invoice.TotalAmount = totalCost; invoice.DueAmount = totalCost - request.PaidAmount;
                _context.PurchaseInvoices.Add(invoice); _context.Inventory.AddRange(newInventoryItems); await _context.SaveChangesAsync();
                foreach (var invItem in newInventoryItems) await LogProductHistory(invItem.Id, "Purchase", invoice.InvoiceNo, $"Purchased (Edited) from supplier ID {request.SupplierId}", null, 1);
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset"); int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability"); int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");
                var jv = new JournalVoucher { VoucherNo = "JV-PUR-EDIT-" + invoice.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "Purchase", ReferenceNo = invoice.InvoiceNo, ComId = 1 };
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = totalCost, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = totalCost, ComId = 1 });
                if (request.PaidAmount > 0) { jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.PaidAmount, Credit = 0, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = 0, Credit = request.PaidAmount, ComId = 1 }); }
                _context.JournalVouchers.Add(jv);
                var newSupplier = await _context.Contacts.FindAsync(request.SupplierId);
                if (newSupplier != null) { newSupplier.SupplierBalance += invoice.DueAmount; _context.ContactLedgers.Add(new ContactLedger { ContactId = newSupplier.Id, TransactionDate = DateTime.UtcNow, Description = $"Purchase Invoice {invoice.InvoiceNo} (Edited)", ReferenceNo = invoice.InvoiceNo, Credit = totalCost, Debit = request.PaidAmount, Balance = newSupplier.SupplierBalance, TransactionType = "Purchase", ComId = 1 }); }
                await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Purchase updated successfully.", InvoiceId = invoice.Id });
            }
            catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpPut("sales/{id}")]
        public async Task<IActionResult> UpdateSale(int id, SalesRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try { var sale = await _context.SalesInvoices.Include(s => s.Details).FirstOrDefaultAsync(s => s.Id == id && s.ComId == 1); if (sale == null) return NotFound("Sale not found."); var itemIds = sale.Details.Select(d => d.InventoryItemId).ToList(); var items = await _context.Inventory.Where(i => itemIds.Contains(i.Id)).ToListAsync(); foreach (var item in items) { item.IsSold = false; } var jv = await _context.JournalVouchers.FirstOrDefaultAsync(j => j.ReferenceNo == sale.InvoiceNo && j.ReferenceType == "Sale"); if (jv != null) _context.JournalVouchers.Remove(jv); _context.SalesInvoices.Remove(sale); await _context.SaveChangesAsync(); var newSale = new SalesInvoice { InvoiceNo = request.InvoiceNo ?? "SAL-" + DateTime.UtcNow.Ticks, SalesDate = DateTime.UtcNow, CustomerId = request.CustomerId, SalesPersonId = request.SalesPersonId, Discount = request.Discount, PaidAmount = request.PaidAmount, ComId = 1 }; decimal subtotal = 0, totalCOGS = 0; foreach (var itemReq in request.Items) { var item = await _context.Inventory.FindAsync(itemReq.InventoryItemId); if (item == null || item.IsSold) return BadRequest("Item not available."); subtotal += item.CurrentSalePrice; totalCOGS += item.CostPrice; item.IsSold = true; item.WarrantyExpiryDate = DateTime.UtcNow.AddMonths(itemReq.WarrantyMonths); newSale.Details.Add(new SalesDetail { InventoryItemId = item.Id, UnitPrice = item.CurrentSalePrice, CostPrice = item.CostPrice, WarrantyMonths = itemReq.WarrantyMonths, ComId = 1 }); } newSale.SubTotal = subtotal; newSale.NetTotal = subtotal - request.Discount; newSale.ChangeAmount = Math.Max(0, request.PaidAmount - newSale.NetTotal); _context.SalesInvoices.Add(newSale); await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Sale updated.", InvoiceId = newSale.Id }); } catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpDelete("purchases/{id}")]
        public async Task<IActionResult> DeletePurchase(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try { var purchase = await _context.PurchaseInvoices.Include(p => p.Details).ThenInclude(d => d.ImeiItems).FirstOrDefaultAsync(p => p.Id == id && p.ComId == 1); if (purchase == null) return NotFound("Purchase not found."); var imeis = purchase.Details.SelectMany(d => d.ImeiItems.Select(im => im.IMEI1)).ToList(); var soldItems = await _context.Inventory.AnyAsync(i => imeis.Contains(i.IMEI1!) && i.IsSold && !i.IsDelete); if (soldItems) return BadRequest("Cannot delete purchase. Some items are already sold."); var inventoryItems = await _context.Inventory.Where(i => imeis.Contains(i.IMEI1!) && !i.IsDelete).ToListAsync(); foreach (var item in inventoryItems) { item.IsDelete = true; await LogProductHistory(item.Id, "PurchaseDelete", purchase.InvoiceNo, "Purchase deleted, item removed from stock"); } var supplier = await _context.Contacts.FindAsync(purchase.SupplierId); if (supplier != null) { supplier.SupplierBalance -= purchase.DueAmount; _context.ContactLedgers.Add(new ContactLedger { ContactId = supplier.Id, TransactionDate = DateTime.UtcNow, Description = $"REVERSED: Purchase Invoice {purchase.InvoiceNo} Deleted", ReferenceNo = purchase.InvoiceNo, Credit = -purchase.TotalAmount, Debit = -purchase.PaidAmount, Balance = supplier.SupplierBalance, TransactionType = "PurchaseDelete", ComId = 1 }); } purchase.IsDelete = true; foreach(var detail in purchase.Details) detail.IsDelete = true; int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset"); int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability"); int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash"); var jv = new JournalVoucher { VoucherNo = "JV-DEL-PUR-" + purchase.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "PurchaseDelete", ReferenceNo = purchase.InvoiceNo, ComId = 1 }; jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = 0, Credit = purchase.TotalAmount, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = purchase.TotalAmount, Credit = 0, ComId = 1 }); if (purchase.PaidAmount > 0) { jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = purchase.PaidAmount, ComId = 1 }); jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = purchase.PaidAmount, Credit = 0, ComId = 1 }); } _context.JournalVouchers.Add(jv); await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Purchase deleted and accounting reversed." }); } catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }
        [HttpPost("report-damage")]
        public async Task<IActionResult> ReportDamage([FromBody] DamageRequest request)
        {
            var item = await _context.Inventory.FindAsync(request.InventoryItemId);
            if (item == null) return NotFound("Item not found.");

            item.IsDelete = true; // Remove from active stock
            await LogProductHistory(item.Id, "Damage", "DMG-" + DateTime.UtcNow.Ticks, $"Marked as {request.Status}: {request.Reason}", item.BranchId, null);
            
            await _context.SaveChangesAsync();
            return Ok(new { Message = $"Item marked as {request.Status}." });
        }

        public class DamageRequest { public int InventoryItemId { get; set; } public string Status { get; set; } = "Damaged"; public string? Reason { get; set; } }

    }
}