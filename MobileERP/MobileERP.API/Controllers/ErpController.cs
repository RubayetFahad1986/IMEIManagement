using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Application.Services;
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
        private readonly IDocumentSequenceService _sequenceService;

        public ErpController(ApplicationDbContext context, IDocumentSequenceService sequenceService)
        {
            _context = context;
            _sequenceService = sequenceService;
        }

        private async Task<int> GetOrCreateAccountAsync(string name, string type)
        {
            var acc = await _context.AccountHeads.FirstOrDefaultAsync(a => a.Name == name);
            if (acc == null)
            {
                string categoryName = type switch { "Asset" or "Cash" or "Bank" => "Assets", "Liability" => "Liabilities", "Equity" => "Equity", "Income" => "Income", "Expense" => "Expense", _ => "Assets" };
                var category = await _context.AccountCategories.FirstOrDefaultAsync(c => c.Name == categoryName);
                if (category == null) { category = new AccountCategory { Name = categoryName, Code = "000" }; _context.AccountCategories.Add(category); await _context.SaveChangesAsync(); }
                acc = new AccountHead { Name = name, AccountType = type == "Cash" || type == "Bank" ? type : "General", AccountCategoryId = category.Id, IsDefault = false };
                _context.AccountHeads.Add(acc);
                await _context.SaveChangesAsync();
            }
            return acc.Id;
        }

        private async Task LogProductHistory(int itemId, string type, string refNo, string desc, int? fromBranch = null, int? toBranch = null)
        {
            _context.ProductHistories.Add(new ProductHistory { InventoryItemId = itemId, EventDate = DateTime.UtcNow, EventType = type, ReferenceNo = refNo, Description = desc, FromBranchId = fromBranch, ToBranchId = toBranch });
        }

        [HttpPost("purchase")]
        public async Task<IActionResult> CreatePurchase(PurchaseRequest request)
        {
            if (request.Items == null || !request.Items.Any()) return BadRequest(new { Message = "No items in purchase request." });
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(request.InvoiceNo)) request.InvoiceNo = await _sequenceService.GetNextSequenceAsync("Purchase");
                else if (await _context.PurchaseInvoices.AnyAsync(p => p.InvoiceNo == request.InvoiceNo)) return BadRequest(new { Message = $"Duplicate Purchase Invoice Number: {request.InvoiceNo}" });
                
                var requestImeis = request.Items.SelectMany(i => i.ImeiItems.Select(im => im.IMEI1)).ToList();
                if (requestImeis.Count != requestImeis.Distinct().Count()) return BadRequest(new { Message = "Duplicate IMEIs found in the same purchase request." });
                
                var existingImeis = await _context.Inventory.Where(i => requestImeis.Contains(i.IMEI1) && !i.IsDelete).Select(i => i.IMEI1).ToListAsync();
                if (existingImeis.Any()) return BadRequest(new { Message = $"The following IMEIs already exist in inventory: {string.Join(", ", existingImeis)}" });
                
                var invoice = new PurchaseInvoice { InvoiceNo = request.InvoiceNo, PurchaseDate = DateTime.UtcNow, SupplierId = request.SupplierId, PaidAmount = request.PaidAmount, ComId = 1, CreateDate = DateTime.UtcNow, IsDelete = false };
                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                decimal totalCost = 0; var inventoryItems = new List<InventoryItem>();
                var durations = await _context.WarrantyDurations.ToListAsync();
                foreach (var item in request.Items)
                {
                    decimal itemCount = item.ProductId.HasValue ? item.Quantity : item.ImeiItems.Count;
                    totalCost += item.CostPrice * itemCount;
                    
                    var detail = new PurchaseDetail 
                    { 
                        MobileDeviceId = item.MobileDeviceId ?? 0, 
                        CostPrice = item.CostPrice, 
                        SalePrice = item.SalePrice, 
                        ComId = 1, 
                        PurchaseInvoiceId = invoice.Id,
                        WarrantyTypeId = item.WarrantyTypeId,
                        WarrantyDurationId = item.WarrantyDurationId,
                        WarrantyCoverageId = item.WarrantyCoverageId,
                        ConditionId = item.ConditionId,
                        MarketTypeId = item.MarketTypeId,
                        WarrantyRemarks = item.WarrantyRemarks
                    };
                    
                    DateTime? endDate = null;
                    if (item.WarrantyDurationId.HasValue)
                    {
                        var duration = durations.FirstOrDefault(d => d.Id == item.WarrantyDurationId);
                        if (duration != null && duration.Days > 0) endDate = DateTime.UtcNow.AddDays(duration.Days);
                    }

                    if (item.ProductId.HasValue)
                    {
                        // Handle Non-IMEI Product
                        inventoryItems.Add(new InventoryItem 
                        { 
                            PurchaseDetail = detail,
                            ProductId = item.ProductId,
                            Quantity = item.Quantity,
                            CostPrice = item.CostPrice, 
                            CurrentSalePrice = item.SalePrice, 
                            CommissionAmount = item.CommissionAmount, 
                            IsSold = false, 
                            BranchId = 1, 
                            ComId = 1, 
                            ConditionId = item.ConditionId,
                            CreateDate = DateTime.UtcNow,
                            PurchaseInvoiceId = invoice.Id
                        });
                    }
                    else
                    {
                        // Handle IMEI Mobile Devices
                        foreach(var imei in item.ImeiItems)
                        {
                            var newImei = new ImeiItem { IMEI1 = imei.IMEI1, IMEI2 = imei.IMEI2, SerialNumber = imei.SerialNumber, ComId = 1 };
                            detail.ImeiItems.Add(newImei);
                            
                            inventoryItems.Add(new InventoryItem 
                            { 
                                PurchaseDetail = detail,
                                MobileDeviceId = item.MobileDeviceId, 
                                ImeiItem = newImei,
                                IMEI1 = imei.IMEI1, 
                                IMEI2 = imei.IMEI2, 
                                CostPrice = item.CostPrice, 
                                CurrentSalePrice = item.SalePrice, 
                                CommissionAmount = item.CommissionAmount, 
                                IsSold = false, 
                                BranchId = 1, 
                                ComId = 1, 
                                ConditionId = item.ConditionId,
                                WarrantyTypeId = item.WarrantyTypeId,
                                WarrantyDurationId = item.WarrantyDurationId,
                                WarrantyCoverageId = item.WarrantyCoverageId,
                                MarketTypeId = item.MarketTypeId,
                                WarrantyStartDate = DateTime.UtcNow,
                                WarrantyEndDate = endDate,
                                WarrantyRemarks = item.WarrantyRemarks,
                                CreateDate = DateTime.UtcNow,
                                PurchaseInvoiceId = invoice.Id
                            });
                        }
                    }
                    invoice.Details.Add(detail);
                }
                invoice.TotalAmount = totalCost; invoice.DueAmount = totalCost - request.PaidAmount;
                _context.Inventory.AddRange(inventoryItems); await _context.SaveChangesAsync();
                
                foreach (var invItem in inventoryItems) await LogProductHistory(invItem.Id, "Purchase", invoice.InvoiceNo, $"Purchased from supplier ID {request.SupplierId}", null, 1);
                
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset"); 
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability"); 
                int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");
                
                var jv = new JournalVoucher { VoucherNo = "JV-PUR-" + invoice.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "Purchase", ReferenceNo = invoice.InvoiceNo, ComId = 1 };
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = totalCost, Credit = 0, ComId = 1 }); 
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = totalCost, ComId = 1 });
                if (request.PaidAmount > 0) 
                { 
                    jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.PaidAmount, Credit = 0, ComId = 1 }); 
                    jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = 0, Credit = request.PaidAmount, ComId = 1 }); 
                }
                _context.JournalVouchers.Add(jv);
                
                var contact = await _context.Contacts.FindAsync(request.SupplierId);
                if (contact != null) 
                { 
                    contact.SupplierBalance += invoice.DueAmount; 
                    _context.ContactLedgers.Add(new ContactLedger { 
                        ContactId = contact.Id, 
                        TransactionDate = DateTime.UtcNow, 
                        Description = $"Purchase Invoice {invoice.InvoiceNo}", 
                        ReferenceNo = invoice.InvoiceNo, 
                        Credit = totalCost, 
                        Debit = request.PaidAmount, 
                        Balance = contact.SupplierBalance, 
                        TransactionType = "Purchase", 
                        ComId = 1 
                    }); 
                }
                
                await _context.SaveChangesAsync(); 
                await transaction.CommitAsync(); 
                return Ok(new { Message = "Purchase recorded successfully.", InvoiceId = invoice.Id });
            } 
            catch (Exception ex) 
            { 
                await transaction.RollbackAsync(); 
                return BadRequest(new { Message = "Critical error saving purchase.", Error = ex.Message, InnerError = ex.InnerException?.Message }); 
            }
        }


        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale(SalesRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(request.InvoiceNo)) request.InvoiceNo = await _sequenceService.GetNextSequenceAsync("Sale");
                else if (await _context.SalesInvoices.AnyAsync(s => s.InvoiceNo == request.InvoiceNo)) return BadRequest("Duplicate Sales Invoice Number.");
                var itemIds = request.Items.Select(i => i.InventoryItemId).ToList();
                var items = await _context.Inventory.Where(i => itemIds.Contains(i.Id) && !i.IsSold).ToListAsync();
                if (items.Count != request.Items.Count) return BadRequest("Items already sold or not found.");
                decimal totalExchangeCredit = 0;
                if (request.IsExchange && request.ReturningInventoryItemIds.Any())
                {
                    var returningItems = await _context.Inventory.Where(i => request.ReturningInventoryItemIds.Contains(i.Id)).ToListAsync();
                    foreach (var rItem in returningItems) { rItem.IsSold = false; totalExchangeCredit += request.ExchangeValue / returningItems.Count; await LogProductHistory(rItem.Id, "ExchangeReturn", "EXC-" + DateTime.UtcNow.Ticks, "Returned via exchange"); }
                }
                var invoice = new SalesInvoice 
                { 
                    InvoiceNo = request.InvoiceNo, 
                    SalesDate = DateTime.UtcNow, 
                    CustomerId = request.CustomerId, 
                    SalesPersonId = request.SalesPersonId, 
                    Discount = request.Discount, 
                    ServiceCharge = request.ServiceCharge, 
                    VAT = request.VAT, 
                    PaidAmount = request.PaidAmount, 
                    WalkInName = request.WalkInName,
                    WalkInPhone = request.WalkInPhone,
                    WalkInAddress = request.WalkInAddress
                };
                decimal subtotal = 0, totalCOGS = 0;
                foreach (var itemReq in request.Items)
                {
                    var item = items.First(i => i.Id == itemReq.InventoryItemId);
                    decimal salePrice = itemReq.UnitPrice ?? item.CurrentSalePrice;
                    subtotal += salePrice; totalCOGS += item.CostPrice; item.IsSold = true; 
                    invoice.Details.Add(new SalesDetail { 
                        InventoryItemId = item.Id, 
                        ImeiItemId = item.ImeiItemId,
                        UnitPrice = salePrice, 
                        CostPrice = item.CostPrice, 
                        CommissionAmount = item.CommissionAmount, 
                        WarrantyMonths = itemReq.WarrantyMonths
                    });
                    await LogProductHistory(item.Id, "Sale", invoice.InvoiceNo, $"Sold to contact ID {request.CustomerId}", item.BranchId, null);
                }
                invoice.SubTotal = subtotal; invoice.NetTotal = subtotal - request.Discount + request.ServiceCharge + request.VAT - totalExchangeCredit; invoice.ChangeAmount = Math.Max(0, request.PaidAmount - invoice.NetTotal);
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

        [HttpGet("inventory")] public async Task<IActionResult> GetInventory(int page = 1, int pageSize = 10, string? search = null, bool includeSold = false, string? stockStatus = null)
        {
            IQueryable<InventoryItem> query = _context.Inventory
                .Include(i => i.MobileDevice)
                .Include(i => i.Product)
                .Where(i => !i.IsDelete);

            if (!includeSold && string.IsNullOrEmpty(stockStatus)) {
                query = query.Where(i => !i.IsSold);
            }

            if (!string.IsNullOrEmpty(stockStatus)) {
                if (stockStatus == "InStock") query = query.Where(i => !i.IsSold);
                else if (stockStatus == "Sold") query = query.Where(i => i.IsSold);
                // Future-proofing: LowStock/NoStock can be added here if needed, 
                // but since these are unique IMEIs, they are either InStock or Sold.
            }

            if (!string.IsNullOrEmpty(search)) {
                search = search.ToLower();
                query = query.Where(i =>
                    (i.IMEI1 != null && i.IMEI1.ToLower().Contains(search)) ||
                    (i.IMEI2 != null && i.IMEI2.ToLower().Contains(search)) ||
                    (i.SerialNumber != null && i.SerialNumber.ToLower().Contains(search)) ||
                    (i.MobileDevice != null && (
                        (i.MobileDevice.ModelName != null && i.MobileDevice.ModelName.ToLower().Contains(search)) ||
                        (i.MobileDevice.Brand != null && i.MobileDevice.Brand.ToLower().Contains(search)) ||
                        (i.MobileDevice.ModelNumber != null && i.MobileDevice.ModelNumber.ToLower().Contains(search)) ||
                        (i.MobileDevice.Barcode != null && i.MobileDevice.Barcode.ToLower().Contains(search)) ||
                        (i.MobileDevice.Color != null && i.MobileDevice.Color.ToLower().Contains(search)) ||
                        (i.MobileDevice.VariantName != null && i.MobileDevice.VariantName.ToLower().Contains(search))
                    )) ||
                    (i.Product != null && i.Product.Name != null && i.Product.Name.ToLower().Contains(search))
                );
            }

            int totalCount = await query.CountAsync();
            
            // Calculate stats for the current context (ComId 1 for now)
            var stats = new
            {
                Total = await _context.Inventory.CountAsync(i => !i.IsDelete),
                InStock = await _context.Inventory.CountAsync(i => !i.IsDelete && !i.IsSold),
                Sold = await _context.Inventory.CountAsync(i => !i.IsDelete && i.IsSold),
                Compromised = await _context.ProductHistories
                    .Where(h => new[] { "Damage", "Lost", "Stolen", "Defective" }.Contains(h.EventType))
                    .Select(h => h.InventoryItemId)
                    .Distinct()
                    .CountAsync()
            };

            var items = await query.OrderByDescending(i => i.CreateDate).Skip((page - 1) * pageSize).Take(pageSize).Select(i => new {
                i.Id,
                i.ImeiItemId,
                imei1 = i.IMEI1 ?? (i.ImeiItem != null ? i.ImeiItem.IMEI1 : ""),
                imei2 = i.IMEI2 ?? (i.ImeiItem != null ? i.ImeiItem.IMEI2 : ""),
                serialNumber = i.SerialNumber ?? (i.ImeiItem != null ? i.ImeiItem.SerialNumber : ""),
                i.IsSold,
                i.Condition,
                i.BoxStatus,
                i.IsOfficial,
                i.CurrentSalePrice,
                i.CostPrice,
                i.WarrantyEndDate,
                i.WarrantyDurationId,
                i.WarrantyMonths,
                i.MobileDeviceId,
                i.ProductId,
                Brand = i.MobileDevice != null ? i.MobileDevice.Brand : (i.Product != null ? "General" : "N/A"),
                ModelName = i.MobileDevice != null ? i.MobileDevice.ModelName : (i.Product != null ? i.Product.Name : "N/A"),
                RAM = i.MobileDevice != null ? i.MobileDevice.RAM : null,
                Storage = i.MobileDevice != null ? i.MobileDevice.Storage : null,
                Color = i.MobileDevice != null ? i.MobileDevice.Color : null,
                VariantName = i.MobileDevice != null ? i.MobileDevice.VariantName : null,
                DeviceName = i.MobileDevice != null ? i.MobileDevice.Brand + " " + i.MobileDevice.ModelName : (i.Product != null ? i.Product.Name : "N/A"),
                PurchaseInfo = _context.ProductHistories.Where(h => h.InventoryItemId == i.Id && h.EventType == "Purchase").Select(h => new { h.EventDate, h.ReferenceNo }).FirstOrDefault(),
                LastActivity = _context.ProductHistories.Where(h => h.InventoryItemId == i.Id).OrderByDescending(h => h.EventDate).FirstOrDefault()
            }).ToListAsync();

            return Ok(new { 
                Items = items, 
                Stats = stats,
                TotalCount = totalCount, 
                PageNumber = page, 
                PageSize = pageSize, 
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) 
            });
        }        
        [HttpGet("sales")]
public async Task<IActionResult> GetSales(int page = 1, int pageSize = 10, string? search = null)
{
    IQueryable<SalesInvoice> query = _context.SalesInvoices;
    if (!string.IsNullOrEmpty(search))
    {
        search = search.ToLower();
        query = query.Where(s => s.InvoiceNo.ToLower().Contains(search) || 
                                 (s.WalkInName != null && s.WalkInName.ToLower().Contains(search)) || 
                                 (s.WalkInPhone != null && s.WalkInPhone.ToLower().Contains(search)));
    }
    int totalCount = await query.CountAsync();
    var items = await query.OrderByDescending(s => s.SalesDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(s => new { 
            s.Id, 
            s.InvoiceNo, 
            s.SalesDate, 
            CustomerName = _context.Contacts.Where(c => c.Id == s.CustomerId).Select(c => c.Name).FirstOrDefault(), 
            s.WalkInName,
            s.WalkInPhone,
            s.WalkInAddress,
            s.NetTotal, 
            s.PaidAmount, 
            s.ChangeAmount 
        }).ToListAsync();
    return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
}
        [HttpGet("purchases")] public async Task<IActionResult> GetPurchases(int page = 1, int pageSize = 10, string? search = null) { IQueryable<PurchaseInvoice> query = _context.PurchaseInvoices.Where(p => !p.IsDelete); if (!string.IsNullOrEmpty(search)) { search = search.ToLower(); query = query.Where(p => p.InvoiceNo.ToLower().Contains(search)); } int totalCount = await query.CountAsync(); var items = await query.OrderByDescending(p => p.PurchaseDate).Skip((page - 1) * pageSize).Take(pageSize).Select(p => new { p.Id, p.InvoiceNo, p.PurchaseDate, SupplierName = _context.Contacts.Where(c => c.Id == p.SupplierId).Select(c => c.Name).FirstOrDefault(), p.TotalAmount, p.PaidAmount, p.DueAmount }).ToListAsync(); return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) }); }
        [HttpGet("sales/{id}")] public async Task<IActionResult> GetSale(int id) { var sale = await _context.SalesInvoices.Include(s => s.Details).ThenInclude(d => d.InventoryItem).ThenInclude(i => i.MobileDevice).Include(s => s.Details).ThenInclude(d => d.InventoryItem).ThenInclude(i => i.ImeiItem).FirstOrDefaultAsync(s => s.Id == id); if (sale == null) return NotFound(); var customer = await _context.Contacts.FindAsync(sale.CustomerId); return Ok(new { Sale = sale, Customer = customer }); }
        [HttpGet("purchases/{id}")]
        public async Task<IActionResult> GetPurchase(int id)
        {
            var purchase = await _context.PurchaseInvoices
                .Include(p => p.Details)
                    .ThenInclude(d => d.MobileDevice)
                .Include(p => p.Details)
                    .ThenInclude(d => d.ImeiItems)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (purchase == null) return NotFound();
            var supplier = await _context.Contacts.FindAsync(purchase.SupplierId);

            // Fetch current inventory status and history for all IMEIs in this purchase
            var allImeiStrings = purchase.Details.SelectMany(d => d.ImeiItems.Select(im => im.IMEI1)).ToList();
            var inventoryItems = await _context.Inventory
                .Where(i => allImeiStrings.Contains(i.IMEI1!) && !i.IsDelete)
                .ToListAsync();

            var invItemIds = inventoryItems.Select(i => i.Id).ToList();
            var productHistories = await _context.ProductHistories
                .Where(h => invItemIds.Contains(h.InventoryItemId))
                .OrderByDescending(h => h.EventDate)
                .ToListAsync();

            var resultDetails = purchase.Details.Select(d => 
            {
                var firstImei = d.ImeiItems.FirstOrDefault();
                var invItemForDetail = firstImei != null ? inventoryItems.FirstOrDefault(i => i.IMEI1 == firstImei.IMEI1) : null;

                return new
                {
                    d.Id,
                    d.MobileDeviceId,
                    d.MobileDevice,
                    d.CostPrice,
                    d.SalePrice,
                    d.WarrantyTypeId,
                    d.WarrantyDurationId,
                    d.WarrantyCoverageId,
                    d.ConditionId,
                    d.MarketTypeId,
                    d.WarrantyRemarks,
                    WarrantyMonths = invItemForDetail?.WarrantyMonths ?? 0,
                    IsOfficial = invItemForDetail?.IsOfficial ?? true,
                    Condition = invItemForDetail?.Condition ?? "New",
                    ImeiItems = d.ImeiItems.Select(im =>
                    {
                        var invItem = inventoryItems.FirstOrDefault(i => i.IMEI1 == im.IMEI1);
                        string statusText = "Available";
                        bool isUsed = false;
                        List<ProductHistory> history = new();

                        if (invItem != null)
                        {
                            if (invItem.IsSold) { statusText = "Sold"; isUsed = true; }
                            else if (invItem.SalesInvoiceId.HasValue) { statusText = "In Sales Process"; isUsed = true; }
                            
                            history = productHistories.Where(h => h.InventoryItemId == invItem.Id).ToList();
                        }

                        return new
                        {
                            im.Id,
                            im.IMEI1,
                            im.IMEI2,
                            im.SerialNumber,
                            Status = statusText,
                            IsUsed = isUsed,
                            History = history
                        };
                    })
                };
            });

            return Ok(new 
            { 
                Purchase = new 
                {
                    purchase.Id,
                    purchase.InvoiceNo,
                    purchase.PurchaseDate,
                    purchase.SupplierId,
                    purchase.TotalAmount,
                    purchase.PaidAmount,
                    purchase.DueAmount,
                    Details = resultDetails
                }, 
                Supplier = supplier 
            });
        }
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
                var purchase = await _context.PurchaseInvoices
                    .Include(p => p.Details)
                        .ThenInclude(d => d.ImeiItems)
                    .FirstOrDefaultAsync(p => p.Id == id && p.ComId == 1);
                
                if (purchase == null) return NotFound(new { Message = "Purchase not found." });

                // 1. Identify sold IMEIs
                var inventoryItems = await _context.Inventory
                    .Where(i => i.PurchaseInvoiceId == id && !i.IsDelete)
                    .ToListAsync();
                var soldImeiStrings = inventoryItems.Where(i => i.IsSold).Select(i => i.IMEI1).ToList();

                // 2. Validate that sold IMEIs are still in the request
                var requestedImeis = request.Items.SelectMany(i => i.ImeiItems.Select(im => im.IMEI1)).Distinct().ToList();
                var removedSoldImeis = soldImeiStrings.Where(s => !requestedImeis.Contains(s)).ToList();
                if (removedSoldImeis.Any()) 
                    return BadRequest(new { Message = $"Cannot remove or change details for sold IMEIs: {string.Join(", ", removedSoldImeis)}" });

                // 3. Validate new IMEIs for duplicates in OTHER active inventory
                if (requestedImeis.Count != request.Items.Sum(i => i.ImeiItems.Count)) 
                    return BadRequest(new { Message = "Duplicate IMEIs found within the update request itself." });

                // Identify which IMEIs are "truly new" to this purchase
                var currentPurchaseImeis = purchase.Details
                    .SelectMany(d => d.ImeiItems.Select(im => im.IMEI1))
                    .Distinct()
                    .ToList();
                
                var trulyNewImeis = requestedImeis.Where(imei => !currentPurchaseImeis.Contains(imei)).ToList();

                if (trulyNewImeis.Any())
                {
                    var existingInOtherInvoices = await _context.Inventory
                        .Where(i => trulyNewImeis.Contains(i.IMEI1) && !i.IsDelete)
                        .Where(i => i.PurchaseInvoiceId != id) // Explicitly check other invoices
                        .Select(i => i.IMEI1)
                        .ToListAsync();

                    if (existingInOtherInvoices.Any())
                        return BadRequest(new { Message = $"The following new IMEIs already exist in other active invoices: {string.Join(", ", existingInOtherInvoices.Distinct())}" });
                }

                // 4. Update Supplier Balance (Revert old due, add new due later)
                var oldSupplier = await _context.Contacts.FindAsync(purchase.SupplierId);
                if (oldSupplier != null) oldSupplier.SupplierBalance -= purchase.DueAmount;

                // 5. Update Header
                string oldInvoiceNo = purchase.InvoiceNo;
                purchase.SupplierId = request.SupplierId;
                purchase.PaidAmount = request.PaidAmount;
                purchase.UpdateDate = DateTime.UtcNow;
                if (!string.IsNullOrWhiteSpace(request.InvoiceNo)) purchase.InvoiceNo = request.InvoiceNo;

                // 6. Synchronize Details
                decimal totalCost = 0;
                var durations = await _context.WarrantyDurations.ToListAsync();
                var currentDetails = purchase.Details.ToList();
                var requestDetailIds = request.Items.Where(i => i.Id.HasValue).Select(i => i.Id.Value).ToList();

                // Mark removed details as deleted
                foreach (var oldDetail in currentDetails)
                {
                    if (!requestDetailIds.Contains(oldDetail.Id))
                    {
                        // Check if this detail contains sold items
                        if (oldDetail.ImeiItems.Any(im => soldImeiStrings.Contains(im.IMEI1)))
                            return BadRequest(new { Message = $"Cannot delete a row that contains sold items (IMEI: {oldDetail.ImeiItems.First(im => soldImeiStrings.Contains(im.IMEI1)).IMEI1})." });

                        oldDetail.IsDelete = true;
                        foreach (var im in oldDetail.ImeiItems) im.IsDelete = true;
                        
                        // Mark linked inventory as deleted
                        var linkedInv = inventoryItems.Where(i => i.PurchaseDetailId == oldDetail.Id).ToList();
                        foreach (var inv in linkedInv) inv.IsDelete = true;
                    }
                }

                foreach (var item in request.Items)
                {
                    decimal itemCount = item.ProductId.HasValue ? item.Quantity : item.ImeiItems.Count;
                    totalCost += item.CostPrice * itemCount;
                    PurchaseDetail detail;
                    
                    if (item.Id.HasValue && (detail = currentDetails.FirstOrDefault(d => d.Id == item.Id.Value)) != null)
                    {
                        // If row contains sold items, validate product hasn't changed to avoid inconsistency
                        if (detail.ImeiItems.Any(im => soldImeiStrings.Contains(im.IMEI1)) && detail.MobileDeviceId != item.MobileDeviceId)
                            return BadRequest(new { Message = "Cannot change the Product for a row that has already been partially or fully sold." });

                        // Update existing detail
                        detail.MobileDeviceId = item.MobileDeviceId;
                        detail.ProductId = item.ProductId;
                        detail.Quantity = item.Quantity;
                        detail.CostPrice = item.CostPrice;
                        detail.SalePrice = item.SalePrice;
                        detail.WarrantyTypeId = item.WarrantyTypeId;
                        detail.WarrantyDurationId = item.WarrantyDurationId;
                        detail.WarrantyCoverageId = item.WarrantyCoverageId;
                        detail.ConditionId = item.ConditionId;
                        detail.MarketTypeId = item.MarketTypeId;
                        detail.WarrantyRemarks = item.WarrantyRemarks;
                        detail.UpdateDate = DateTime.UtcNow;
                    }
                    else
                    {
                        // Add new detail
                        detail = new PurchaseDetail 
                        { 
                            PurchaseInvoiceId = purchase.Id,
                            MobileDeviceId = item.MobileDeviceId, 
                            ProductId = item.ProductId,
                            Quantity = item.Quantity,
                            CostPrice = item.CostPrice, 
                            SalePrice = item.SalePrice, 
                            ComId = 1,
                            WarrantyTypeId = item.WarrantyTypeId,
                            WarrantyDurationId = item.WarrantyDurationId,
                            WarrantyCoverageId = item.WarrantyCoverageId,
                            ConditionId = item.ConditionId,
                            MarketTypeId = item.MarketTypeId,
                            WarrantyRemarks = item.WarrantyRemarks
                        };
                        _context.PurchaseDetails.Add(detail);
                    }

                    // Synchronize IMEIs for this detail (Skip if it's a general product)
                    if (!item.ProductId.HasValue)
                    {
                        DateTime? endDate = null;
                        if (item.WarrantyDurationId.HasValue)
                        {
                            var duration = durations.FirstOrDefault(d => d.Id == item.WarrantyDurationId);
                            if (duration != null && duration.Days > 0) endDate = DateTime.UtcNow.AddDays(duration.Days);
                        }

                        var currentImeiItems = detail.ImeiItems.Where(im => !im.IsDelete).ToList();
                        var requestImeiIds = item.ImeiItems.Where(im => im.Id.HasValue).Select(im => im.Id.Value).ToList();
                        var requestImeiStrings = item.ImeiItems.Select(im => im.IMEI1).ToList();

                        // Remove IMEIs not in request
                        foreach (var oldImei in currentImeiItems)
                        {
                            // Match by ID if possible, otherwise by string
                            bool stillExists = requestImeiIds.Contains(oldImei.Id) || (oldImei.IMEI1 != null && requestImeiStrings.Contains(oldImei.IMEI1));
                            if (!stillExists)
                            {
                                oldImei.IsDelete = true;
                                var inv = inventoryItems.FirstOrDefault(i => i.IMEI1 == oldImei.IMEI1 && i.PurchaseDetailId == detail.Id);
                                if (inv != null) inv.IsDelete = true;
                            }
                        }

                        // Add or Update IMEIs
                        foreach (var reqImei in item.ImeiItems)
                        {
                            ImeiItem existingImei = null;
                            if (reqImei.Id.HasValue) existingImei = currentImeiItems.FirstOrDefault(im => im.Id == reqImei.Id.Value);
                            else existingImei = currentImeiItems.FirstOrDefault(im => im.IMEI1 == reqImei.IMEI1);

                            if (existingImei == null)
                            {
                                // ADD NEW
                                var newImei = new ImeiItem { IMEI1 = reqImei.IMEI1, IMEI2 = reqImei.IMEI2, SerialNumber = reqImei.SerialNumber, ComId = 1 };
                                detail.ImeiItems.Add(newImei);
                                
                                _context.Inventory.Add(new InventoryItem 
                                { 
                                    PurchaseDetail = detail,
                                    MobileDeviceId = item.MobileDeviceId, 
                                    ImeiItem = newImei,
                                    IMEI1 = reqImei.IMEI1, 
                                    IMEI2 = reqImei.IMEI2, 
                                    CostPrice = item.CostPrice, 
                                    CurrentSalePrice = item.SalePrice, 
                                    CommissionAmount = item.CommissionAmount, 
                                    IsSold = false, 
                                    BranchId = 1, 
                                    ComId = 1, 
                                    CreateDate = DateTime.UtcNow,
                                    ConditionId = item.ConditionId,
                                    WarrantyTypeId = item.WarrantyTypeId,
                                    WarrantyDurationId = item.WarrantyDurationId,
                                    WarrantyCoverageId = item.WarrantyCoverageId,
                                    MarketTypeId = item.MarketTypeId,
                                    WarrantyRemarks = item.WarrantyRemarks,
                                    WarrantyStartDate = DateTime.UtcNow,
                                    WarrantyEndDate = endDate,
                                    PurchaseInvoiceId = purchase.Id
                                });
                            }
                            else
                            {
                                // UPDATE EXISTING
                                var inv = inventoryItems.FirstOrDefault(i => i.IMEI1 == existingImei.IMEI1 && i.PurchaseDetailId == detail.Id);
                                
                                if (inv != null && inv.IsSold)
                                {
                                    // Strictly block any changes to sold items' core identifiers
                                    if (existingImei.IMEI1 != reqImei.IMEI1)
                                        return BadRequest(new { Message = $"Cannot change IMEI for sold item (ID: {existingImei.Id}, Old IMEI: {existingImei.IMEI1})" });
                                    
                                    // ID stays same, we just skip updating fields for sold items
                                    continue;
                                }

                                // Update IMEI record (identity preserved)
                                existingImei.IMEI1 = reqImei.IMEI1;
                                existingImei.IMEI2 = reqImei.IMEI2;
                                existingImei.SerialNumber = reqImei.SerialNumber;
                                existingImei.UpdateDate = DateTime.UtcNow;

                                // Update Inventory record
                                if (inv != null)
                                {
                                    inv.IMEI1 = reqImei.IMEI1;
                                    inv.IMEI2 = reqImei.IMEI2;
                                    inv.MobileDeviceId = item.MobileDeviceId;
                                    inv.CostPrice = item.CostPrice;
                                    inv.CurrentSalePrice = item.SalePrice;
                                    inv.ConditionId = item.ConditionId;
                                    inv.WarrantyTypeId = item.WarrantyTypeId;
                                    inv.WarrantyDurationId = item.WarrantyDurationId;
                                    inv.WarrantyCoverageId = item.WarrantyCoverageId;
                                    inv.MarketTypeId = item.MarketTypeId;
                                    inv.WarrantyRemarks = item.WarrantyRemarks;
                                    inv.WarrantyEndDate = endDate;
                                    inv.UpdateDate = DateTime.UtcNow;
                                    inv.PurchaseInvoiceId = purchase.Id; // Ensure link is set
                                    inv.ImeiItemId = existingImei.Id; // Fix link if missing
                                }
                            }
                        }
                    }
                    else
                    {
                        // Update Inventory for General Product (Non-IMEI)
                        var inv = inventoryItems.FirstOrDefault(i => i.ProductId == item.ProductId && i.PurchaseDetailId == detail.Id);
                        if (inv == null)
                        {
                            _context.Inventory.Add(new InventoryItem 
                            { 
                                PurchaseDetail = detail,
                                ProductId = item.ProductId,
                                Quantity = item.Quantity,
                                CostPrice = item.CostPrice, 
                                CurrentSalePrice = item.SalePrice, 
                                CommissionAmount = item.CommissionAmount, 
                                IsSold = false, 
                                BranchId = 1, 
                                ComId = 1, 
                                CreateDate = DateTime.UtcNow,
                                PurchaseInvoiceId = purchase.Id,
                                ConditionId = item.ConditionId
                            });
                        }
                        else
                        {
                            inv.Quantity = item.Quantity;
                            inv.CostPrice = item.CostPrice;
                            inv.CurrentSalePrice = item.SalePrice;
                            inv.UpdateDate = DateTime.UtcNow;
                            inv.ConditionId = item.ConditionId;
                        }
                    }
                }
                
                purchase.TotalAmount = totalCost; 
                purchase.DueAmount = totalCost - request.PaidAmount;

                // 7. Update New Supplier Balance
                var newSupplier = await _context.Contacts.FindAsync(request.SupplierId);
                if (newSupplier != null) newSupplier.SupplierBalance += purchase.DueAmount;

                // 8. Update Financial Records (Prefer update over delete/re-insert)
                var jv = await _context.JournalVouchers.Include(j => j.Entries).FirstOrDefaultAsync(j => j.ReferenceNo == oldInvoiceNo && j.ReferenceType == "Purchase" && !j.IsDelete);
                var ledger = await _context.ContactLedgers.FirstOrDefaultAsync(l => l.ReferenceNo == oldInvoiceNo && !l.IsDelete);

                if (jv != null) 
                {
                    jv.ReferenceNo = purchase.InvoiceNo;
                    jv.VoucherNo = "JV-PUR-EDIT-" + purchase.Id;
                    jv.UpdateDate = DateTime.UtcNow;
                    _context.JournalEntries.RemoveRange(jv.Entries);
                }
                else 
                {
                    jv = new JournalVoucher { VoucherNo = "JV-PUR-EDIT-" + purchase.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "Purchase", ReferenceNo = purchase.InvoiceNo, ComId = 1 };
                    _context.JournalVouchers.Add(jv);
                }

                if (ledger != null)
                {
                    ledger.ReferenceNo = purchase.InvoiceNo;
                    ledger.ContactId = newSupplier?.Id ?? purchase.SupplierId;
                    ledger.Description = $"Purchase Invoice {purchase.InvoiceNo} (Edited)";
                    ledger.Credit = totalCost;
                    ledger.Debit = request.PaidAmount;
                    ledger.Balance = newSupplier?.SupplierBalance ?? 0;
                    ledger.UpdateDate = DateTime.UtcNow;
                }
                else if (newSupplier != null)
                {
                    ledger = new ContactLedger { 
                        ContactId = newSupplier.Id, 
                        TransactionDate = DateTime.UtcNow, 
                        Description = $"Purchase Invoice {purchase.InvoiceNo} (Edited)", 
                        ReferenceNo = purchase.InvoiceNo, 
                        Credit = totalCost, 
                        Debit = request.PaidAmount, 
                        Balance = newSupplier.SupplierBalance, 
                        TransactionType = "Purchase", 
                        ComId = 1 
                    };
                    _context.ContactLedgers.Add(ledger);
                }

                // Collect new inventory items BEFORE SaveChanges to capture Added state
                var newInventoryItems = _context.ChangeTracker.Entries<InventoryItem>()
                    .Where(e => e.State == EntityState.Added)
                    .Select(e => e.Entity)
                    .ToList();

                await _context.SaveChangesAsync();

                // Log History for new items
                foreach (var invItem in newInventoryItems) 
                    await LogProductHistory(invItem.Id, "Purchase", purchase.InvoiceNo, $"Purchased (Edited) from supplier ID {request.SupplierId}", null, 1);
                
                // Add new Financial Entries
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset"); 
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability"); 
                int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");
                
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = totalCost, Credit = 0, ComId = 1 }); 
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = totalCost, ComId = 1 });
                if (request.PaidAmount > 0) 
                { 
                    jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.PaidAmount, Credit = 0, ComId = 1 }); 
                    jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = 0, Credit = request.PaidAmount, ComId = 1 }); 
                }
                
                await _context.SaveChangesAsync(); 
                await transaction.CommitAsync(); 
                return Ok(new { Message = "Purchase updated successfully.", InvoiceId = purchase.Id });
            }
            catch (Exception ex) 
            { 
                await transaction.RollbackAsync(); 
                return BadRequest(new { Message = "Failed to update purchase.", Error = ex.Message, InnerError = ex.InnerException?.Message }); 
            }
        }

        [HttpPut("sales/{id}")]
        public async Task<IActionResult> UpdateSale(int id, SalesRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try { 
                var sale = await _context.SalesInvoices.Include(s => s.Details).FirstOrDefaultAsync(s => s.Id == id && s.ComId == 1); 
                if (sale == null) return NotFound("Sale not found."); 
                
                var itemIds = sale.Details.Select(d => d.InventoryItemId).ToList(); 
                var items = await _context.Inventory.Where(i => itemIds.Contains(i.Id)).ToListAsync(); 
                foreach (var item in items) { item.IsSold = false; } 
                
                if (sale.CustomerId.HasValue)
                {
                    var contact = await _context.Contacts.FindAsync(sale.CustomerId.Value);
                    if (contact != null)
                    {
                        decimal oldDue = sale.NetTotal - sale.PaidAmount;
                        contact.CustomerBalance -= oldDue;
                        
                        // Mark old ledger entries as deleted
                        var oldLedgers = await _context.ContactLedgers
                            .Where(l => l.ReferenceNo == sale.InvoiceNo && l.ContactId == contact.Id && !l.IsDelete)
                            .ToListAsync();
                        foreach(var l in oldLedgers) l.IsDelete = true;
                    }
                }

                var jv = await _context.JournalVouchers.Include(v => v.Entries).FirstOrDefaultAsync(j => j.ReferenceNo == sale.InvoiceNo && j.ReferenceType == "Sale"); 
                if (jv != null) {
                    jv.IsDelete = true;
                    foreach (var entry in jv.Entries) entry.IsDelete = true;
                }
                
                sale.IsDelete = true;
                foreach(var d in sale.Details) d.IsDelete = true;
                await _context.SaveChangesAsync(); 
                
                var newSale = new SalesInvoice 
                { 
                    InvoiceNo = request.InvoiceNo ?? "SAL-" + DateTime.UtcNow.Ticks, 
                    SalesDate = DateTime.UtcNow, 
                    CustomerId = request.CustomerId, 
                    SalesPersonId = request.SalesPersonId, 
                    Discount = request.Discount, 
                    ServiceCharge = request.ServiceCharge, 
                    VAT = request.VAT, 
                    PaidAmount = request.PaidAmount, 
                    ComId = 1,
                    WalkInName = request.WalkInName,
                    WalkInPhone = request.WalkInPhone,
                    WalkInAddress = request.WalkInAddress
                }; 
                decimal subtotal = 0, totalCOGS = 0; 
                foreach (var itemReq in request.Items) { 
                    var item = await _context.Inventory.FindAsync(itemReq.InventoryItemId); 
                    if (item == null || (item.IsSold && !itemIds.Contains(item.Id))) return BadRequest("Item not available."); 
                    decimal salePrice = itemReq.UnitPrice ?? item.CurrentSalePrice; 
                    subtotal += salePrice; totalCOGS += item.CostPrice; item.IsSold = true; 
                    newSale.Details.Add(new SalesDetail { 
                        InventoryItemId = item.Id, 
                        ImeiItemId = item.ImeiItemId,
                        UnitPrice = salePrice, 
                        CostPrice = item.CostPrice, 
                        WarrantyMonths = itemReq.WarrantyMonths, 
                        ComId = 1 
                    }); 
                } 
                newSale.SubTotal = subtotal; newSale.NetTotal = subtotal - request.Discount + request.ServiceCharge + request.VAT; 
                newSale.ChangeAmount = Math.Max(0, request.PaidAmount - newSale.NetTotal); 
                _context.SalesInvoices.Add(newSale); 
                
                if (newSale.CustomerId.HasValue)
                {
                    var contact = await _context.Contacts.FindAsync(newSale.CustomerId.Value);
                    if (contact != null)
                    {
                        decimal newDue = newSale.NetTotal - Math.Min(newSale.PaidAmount, newSale.NetTotal);
                        contact.CustomerBalance += newDue;
                        _context.ContactLedgers.Add(new ContactLedger { 
                            ContactId = contact.Id, 
                            TransactionDate = DateTime.UtcNow, 
                            Description = $"Sales Invoice {newSale.InvoiceNo}", 
                            ReferenceNo = newSale.InvoiceNo, 
                            Debit = newSale.NetTotal, 
                            Credit = Math.Min(newSale.PaidAmount, newSale.NetTotal), 
                            Balance = contact.CustomerBalance, 
                            TransactionType = "Sale", 
                            ComId = 1 
                        });
                    }
                }

                await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Sale updated.", InvoiceId = newSale.Id }); 
            } catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpDelete("purchases/{id}")]
        public async Task<IActionResult> DeletePurchase(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try { 
                var purchase = await _context.PurchaseInvoices.Include(p => p.Details).ThenInclude(d => d.ImeiItems).FirstOrDefaultAsync(p => p.Id == id && p.ComId == 1); 
                if (purchase == null) return NotFound("Purchase not found."); 
                
                var inventoryItems = await _context.Inventory.Where(i => i.PurchaseInvoiceId == id && !i.IsDelete).ToListAsync(); 
                foreach (var item in inventoryItems) { 
                    item.IsDelete = true; 
                    await LogProductHistory(item.Id, "PurchaseDelete", purchase.InvoiceNo, "Purchase deleted, item removed from stock"); 
                } 
                
                var supplier = await _context.Contacts.FindAsync(purchase.SupplierId); 
                if (supplier != null) { 
                    supplier.SupplierBalance -= purchase.DueAmount; 
                    // Mark ledger entries as deleted
                    var oldLedgers = await _context.ContactLedgers
                        .Where(l => l.ReferenceNo == purchase.InvoiceNo && l.ContactId == supplier.Id && !l.IsDelete)
                        .ToListAsync();
                    foreach(var l in oldLedgers) l.IsDelete = true;
                } 
                
                purchase.IsDelete = true; 
                foreach(var detail in purchase.Details) detail.IsDelete = true; 
                
                var oldJv = await _context.JournalVouchers.Include(v => v.Entries).FirstOrDefaultAsync(j => j.ReferenceNo == purchase.InvoiceNo && j.ReferenceType == "Purchase");
                if (oldJv != null) {
                    oldJv.IsDelete = true;
                    foreach (var entry in oldJv.Entries) entry.IsDelete = true;
                }

                await _context.SaveChangesAsync(); await transaction.CommitAsync(); return Ok(new { Message = "Purchase deleted." });
            } catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpDelete("sales/{id}")]
        public async Task<IActionResult> DeleteSale(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try {
                var sale = await _context.SalesInvoices.Include(s => s.Details).FirstOrDefaultAsync(s => s.Id == id && s.ComId == 1);
                if (sale == null) return NotFound("Sale not found.");

                // 1. Revert Stock Status
                var itemIds = sale.Details.Select(d => d.InventoryItemId).ToList();
                var items = await _context.Inventory.Where(i => itemIds.Contains(i.Id)).ToListAsync();
                foreach (var item in items) {
                    item.IsSold = false;
                    await LogProductHistory(item.Id, "SaleDelete", sale.InvoiceNo, "Sale deleted, item returned to stock");
                }

                // 2. Revert Customer Balance & Ledger
                if (sale.CustomerId.HasValue) {
                    var contact = await _context.Contacts.FindAsync(sale.CustomerId.Value);
                    if (contact != null) {
                        decimal due = sale.NetTotal - sale.PaidAmount;
                        contact.CustomerBalance -= due;
                        
                        var ledgers = await _context.ContactLedgers.Where(l => l.ReferenceNo == sale.InvoiceNo && l.TransactionType == "Sale").ToListAsync();
                        foreach(var l in ledgers) l.IsDelete = true;
                    }
                }

                // 3. Mark Financial Records as Deleted
                var jv = await _context.JournalVouchers.Include(v => v.Entries).FirstOrDefaultAsync(j => j.ReferenceNo == sale.InvoiceNo && j.ReferenceType == "Sale");
                if (jv != null) {
                    jv.IsDelete = true;
                    foreach (var entry in jv.Entries) entry.IsDelete = true;
                }

                // 4. Soft Delete the Sale
                sale.IsDelete = true;
                foreach(var d in sale.Details) d.IsDelete = true;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { Message = "Sale deleted successfully." });
            }
            catch (Exception ex) {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
        [HttpPost("report-damage")]
        public async Task<IActionResult> ReportDamage([FromBody] DamageRequest request)
        {
            var item = await _context.Inventory.FindAsync(request.InventoryItemId);
            if (item == null) return NotFound("Item not found.");

            item.IsDelete = true; // Remove from active stock
            // 2. Add to History
            await LogProductHistory(item.Id, "Damage", "DMG-" + DateTime.UtcNow.Ticks, $"Marked as {request.Status}: {request.Reason}", item.BranchId, null);

            // 3. Find and delete related Journal Voucher if it exists for this reference
            // Damage transactions sometimes have auto-vouchers if configured (e.g. stock write-off)
            var jv = await _context.JournalVouchers.Include(v => v.Entries)
                .FirstOrDefaultAsync(j => j.ReferenceNo == item.Id.ToString() && j.ReferenceType == "Damage" && !j.IsDelete);
            if (jv != null)
            {
                jv.IsDelete = true;
                foreach (var entry in jv.Entries) entry.IsDelete = true;
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = $"Item marked as {request.Status}." });
        }

        [HttpPost("stock-audit")]
        public async Task<IActionResult> PerformStockAudit([FromBody] StockAuditRequest request)
        {
            if (request.Items == null || !request.Items.Any()) return BadRequest("No items provided for audit.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                string auditRef = "AUDIT-" + DateTime.UtcNow.ToString("yyyyMMddHHmm");
                int adjustedCount = 0;

                foreach (var auditItem in request.Items)
                {
                    var invItem = await _context.Inventory
                        .Include(i => i.MobileDevice)
                        .Include(i => i.Product)
                        .FirstOrDefaultAsync(i => i.Id == auditItem.InventoryItemId && !i.IsDelete && !i.IsSold);

                    if (invItem == null) continue;

                    if (invItem.MobileDeviceId.HasValue) // IMEI tracked item
                    {
                        if (!auditItem.IsPresent)
                        {
                            invItem.IsDelete = true;
                            await LogProductHistory(invItem.Id, "Adjustment", auditRef, $"Stock Audit: Item not found. Remarks: {request.Remarks}", invItem.BranchId, null);
                            adjustedCount++;
                        }
                    }
                    else if (invItem.ProductId.HasValue) // General product
                    {
                        if (invItem.Quantity != auditItem.PhysicalQuantity)
                        {
                            decimal diff = auditItem.PhysicalQuantity - invItem.Quantity;
                            string desc = $"Stock Audit: Physical count {auditItem.PhysicalQuantity} vs Software count {invItem.Quantity}. Diff: {diff}. Remarks: {request.Remarks}";
                            
                            invItem.Quantity = auditItem.PhysicalQuantity;
                            if (invItem.Quantity <= 0) invItem.IsDelete = true;

                            await LogProductHistory(invItem.Id, "Adjustment", auditRef, desc, invItem.BranchId, null);
                            adjustedCount++;
                        }
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = $"Stock audit completed. {adjustedCount} items adjusted.", Reference = auditRef });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { Message = "Failed to perform stock audit.", Error = ex.Message });
            }
        }

        public class DamageRequest { public int InventoryItemId { get; set; } public string Status { get; set; } = "Damaged"; public string? Reason { get; set; } }

    }
}
