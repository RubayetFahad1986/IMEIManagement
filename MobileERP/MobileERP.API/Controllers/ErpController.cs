using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;

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
                acc = new AccountHead { Name = name, AccountType = type, ComId = 1 };
                _context.AccountHeads.Add(acc);
                await _context.SaveChangesAsync();
            }
            return acc.Id;
        }

        private async Task LogProductHistory(int itemId, string type, string refNo, string desc, int? fromBranch = null, int? toBranch = null)
        {
            _context.ProductHistories.Add(new ProductHistory
            {
                InventoryItemId = itemId,
                EventDate = DateTime.UtcNow,
                EventType = type,
                ReferenceNo = refNo,
                Description = desc,
                FromBranchId = fromBranch,
                ToBranchId = toBranch,
                ComId = 1
            });
        }

        [HttpPost("purchase")]
        public async Task<IActionResult> CreatePurchase(PurchaseRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var invoice = new PurchaseInvoice
                {
                    InvoiceNo = request.InvoiceNo,
                    PurchaseDate = DateTime.UtcNow,
                    SupplierId = request.SupplierId,
                    PaidAmount = request.PaidAmount,
                    ComId = 1
                };

                decimal totalCost = 0;
                foreach (var item in request.Items)
                {
                    totalCost += item.CostPrice;
                    invoice.Details.Add(new PurchaseDetail
                    {
                        MobileDeviceId = item.MobileDeviceId,
                        IMEI1 = item.IMEI1,
                        IMEI2 = item.IMEI2,
                        CostPrice = item.CostPrice,
                        SalePrice = item.SalePrice,
                        ComId = 1
                    });

                    var invItem = new InventoryItem
                    {
                        MobileDeviceId = item.MobileDeviceId,
                        IMEI1 = item.IMEI1,
                        IMEI2 = item.IMEI2,
                        CostPrice = item.CostPrice,
                        CurrentSalePrice = item.SalePrice,
                        CommissionAmount = item.CommissionAmount,
                        IsSold = false,
                        BranchId = 1,
                        ComId = 1
                    };
                    _context.Inventory.Add(invItem);
                    await _context.SaveChangesAsync();

                    await LogProductHistory(invItem.Id, "Purchase", request.InvoiceNo, $"Purchased from supplier ID {request.SupplierId}", null, 1);
                }

                invoice.TotalAmount = totalCost;
                invoice.DueAmount = totalCost - request.PaidAmount;
                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                // Accounting
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset");
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability");
                int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");

                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-PUR-" + invoice.Id,
                    VoucherDate = DateTime.UtcNow,
                    ReferenceType = "Purchase",
                    ReferenceNo = invoice.InvoiceNo,
                    ComId = 1
                };

                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = totalCost, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = totalCost, ComId = 1 });

                if (request.PaidAmount > 0)
                {
                    jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.PaidAmount, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = 0, Credit = request.PaidAmount, ComId = 1 });
                }
                _context.JournalVouchers.Add(jv);

                // Contact Ledger (Supplier Role)
                var contact = await _context.Contacts.FindAsync(request.SupplierId);
                if (contact != null)
                {
                    contact.SupplierBalance += invoice.DueAmount;
                    
                    _context.ContactLedgers.Add(new ContactLedger
                    {
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

                return Ok(new { Message = "Purchase recorded.", InvoiceId = invoice.Id });
            }
            catch(Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale(SalesRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var itemIds = request.Items.Select(i => i.InventoryItemId).ToList();
                var items = await _context.Inventory.Where(i => itemIds.Contains(i.Id) && !i.IsSold).ToListAsync();

                if (items.Count != request.Items.Count)
                    return BadRequest("Items already sold or not found.");

                decimal totalExchangeCredit = 0;
                if (request.IsExchange && request.ReturningInventoryItemIds.Any())
                {
                    var returningItems = await _context.Inventory.Where(i => request.ReturningInventoryItemIds.Contains(i.Id)).ToListAsync();
                    foreach (var rItem in returningItems)
                    {
                        rItem.IsSold = false;
                        totalExchangeCredit += request.ExchangeValue / returningItems.Count;
                        await LogProductHistory(rItem.Id, "ExchangeReturn", "EXC-" + DateTime.UtcNow.Ticks, "Returned via exchange");
                    }
                }

                var invoice = new SalesInvoice
                {
                    InvoiceNo = "SAL-" + DateTime.UtcNow.Ticks,
                    SalesDate = DateTime.UtcNow,
                    CustomerId = request.CustomerId,
                    SalesPersonId = request.SalesPersonId,
                    Discount = request.Discount,
                    PaidAmount = request.PaidAmount,
                    ComId = 1
                };

                decimal subtotal = 0, totalCOGS = 0, totalComm = 0;
                foreach (var itemReq in request.Items)
                {
                    var item = items.First(i => i.Id == itemReq.InventoryItemId);
                    subtotal += item.CurrentSalePrice;
                    totalCOGS += item.CostPrice;
                    totalComm += item.CommissionAmount;
                    item.IsSold = true;
                    item.WarrantyExpiryDate = DateTime.UtcNow.AddMonths(itemReq.WarrantyMonths);
                    
                    invoice.Details.Add(new SalesDetail
                    {
                        InventoryItemId = item.Id,
                        UnitPrice = item.CurrentSalePrice,
                        CostPrice = item.CostPrice,
                        CommissionAmount = item.CommissionAmount,
                        WarrantyMonths = itemReq.WarrantyMonths,
                        ComId = 1
                    });
                    await LogProductHistory(item.Id, "Sale", invoice.InvoiceNo, $"Sold to contact ID {request.CustomerId}", item.BranchId, null);
                }

                invoice.SubTotal = subtotal;
                invoice.NetTotal = subtotal - request.Discount - totalExchangeCredit;
                invoice.ChangeAmount = Math.Max(0, request.PaidAmount - invoice.NetTotal);
                _context.SalesInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                // Commission
                if (request.SalesPersonId.HasValue && totalComm > 0)
                {
                    var employee = await _context.Employees.FindAsync(request.SalesPersonId.Value);
                    if (employee != null)
                    {
                        employee.TotalCommissionEarned += totalComm;
                        _context.EmployeeCommissions.Add(new EmployeeCommission { EmployeeId = employee.Id, SalesInvoiceId = invoice.Id, TransactionDate = DateTime.UtcNow, TransactionType = "Earning", Amount = totalComm, ComId = 1 });
                    }
                }

                // Accounting
                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset");
                int salesAccId = await GetOrCreateAccountAsync("Sales Revenue", "Income");
                int cogsAccId = await GetOrCreateAccountAsync("Cost of Goods Sold", "Expense");
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset");
                int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");

                var jv = new JournalVoucher { VoucherNo = "JV-SAL-" + invoice.Id, VoucherDate = DateTime.UtcNow, ReferenceType = "Sale", ReferenceNo = invoice.InvoiceNo, ComId = 1 };
                jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = invoice.NetTotal, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = salesAccId, Debit = 0, Credit = subtotal - request.Discount, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = cogsAccId, Debit = totalCOGS, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = 0, Credit = totalCOGS, ComId = 1 });

                if (request.PaidAmount > 0)
                {
                    decimal actualPaid = Math.Min(request.PaidAmount, invoice.NetTotal);
                    jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = actualPaid, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = actualPaid, ComId = 1 });
                }
                _context.JournalVouchers.Add(jv);

                // Contact Ledger (Customer Role)
                if (request.CustomerId.HasValue)
                {
                    var contact = await _context.Contacts.FindAsync(request.CustomerId.Value);
                    if (contact != null)
                    {
                        decimal due = invoice.NetTotal - Math.Min(request.PaidAmount, invoice.NetTotal);
                        contact.CustomerBalance += due;
                        _context.ContactLedgers.Add(new ContactLedger { ContactId = contact.Id, TransactionDate = DateTime.UtcNow, Description = $"Sales Invoice {invoice.InvoiceNo}", ReferenceNo = invoice.InvoiceNo, Debit = invoice.NetTotal, Credit = Math.Min(request.PaidAmount, invoice.NetTotal), Balance = contact.CustomerBalance, TransactionType = "Sale", ComId = 1 });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { Message = "Sale recorded.", InvoiceId = invoice.Id });
            }
            catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpPost("contacts/adjust-balance")]
        public async Task<IActionResult> AdjustBalance(BalanceAdjustmentRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var contact = await _context.Contacts.FindAsync(request.ContactId);
                if (contact == null) return NotFound("Contact not found.");

                if (request.Direction == "CustToSupp") // Reduce Customer Debt using Supplier Credit
                {
                    contact.CustomerBalance -= request.AdjustmentAmount;
                    contact.SupplierBalance -= request.AdjustmentAmount;
                }
                else if (request.Direction == "SuppToCust") // Reduce Supplier Debt using Customer Credit
                {
                    contact.SupplierBalance -= request.AdjustmentAmount;
                    contact.CustomerBalance -= request.AdjustmentAmount;
                }

                _context.ContactLedgers.Add(new ContactLedger
                {
                    ContactId = contact.Id,
                    TransactionDate = DateTime.UtcNow,
                    Description = $"Balance Netting Adjustment: {request.Remarks}",
                    Debit = request.AdjustmentAmount,
                    Credit = request.AdjustmentAmount,
                    Balance = contact.NetBalance,
                    TransactionType = "Adjustment",
                    ComId = 1
                });

                // Accounting JV for Netting
                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset");
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability");

                var jv = new JournalVoucher { VoucherNo = "JV-ADJ-" + DateTime.UtcNow.Ticks, VoucherDate = DateTime.UtcNow, ReferenceType = "Adjustment", ReferenceNo = contact.Name, ComId = 1 };
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.AdjustmentAmount, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = request.AdjustmentAmount, ComId = 1 });

                _context.JournalVouchers.Add(jv);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Balance adjusted and journalized.", contact.NetBalance });
            }
            catch (Exception ex) { await transaction.RollbackAsync(); return BadRequest(ex.Message); }
        }

        [HttpGet("warranty/status/{imei}")]
        public async Task<IActionResult> GetWarrantyStatus(string imei)
        {
            var item = await _context.Inventory.Include(i => i.MobileDevice).FirstOrDefaultAsync(i => i.IMEI1 == imei || i.IMEI2 == imei);
            if (item == null) return NotFound("IMEI not found.");
            if (!item.IsSold) return Ok(new { IsSold = false, Message = "In stock." });
            var remaining = (item.WarrantyExpiryDate.HasValue) ? (item.WarrantyExpiryDate.Value - DateTime.UtcNow).Days : 0;
            return Ok(new { item.IMEI1, Device = item.MobileDevice?.ModelName, ExpiryDate = item.WarrantyExpiryDate, RemainingDays = Math.Max(0, remaining), IsActive = remaining > 0 });
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<InventoryItem> query = _context.Inventory.Include(i => i.MobileDevice);
            
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(i => i.IMEI1.ToLower().Contains(search) || i.IMEI2.ToLower().Contains(search) || (i.MobileDevice != null && i.MobileDevice.ModelName.ToLower().Contains(search)));
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(i => i.Id)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
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
        
        [HttpGet("sales")]
        public async Task<IActionResult> GetSales(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<SalesInvoice> query = _context.SalesInvoices;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(s => s.InvoiceNo.ToLower().Contains(search));
            }
            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(s => s.SalesDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new {
                    s.Id,
                    s.InvoiceNo,
                    s.SalesDate,
                    CustomerName = _context.Contacts.Where(c => c.Id == s.CustomerId).Select(c => c.Name).FirstOrDefault(),
                    s.NetTotal,
                    s.PaidAmount,
                    s.ChangeAmount
                })
                .ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }

        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchases(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<PurchaseInvoice> query = _context.PurchaseInvoices;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(p => p.InvoiceNo.ToLower().Contains(search));
            }
            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.PurchaseDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new {
                    p.Id,
                    p.InvoiceNo,
                    p.PurchaseDate,
                    SupplierName = _context.Contacts.Where(c => c.Id == p.SupplierId).Select(c => c.Name).FirstOrDefault(),
                    p.TotalAmount,
                    p.PaidAmount,
                    p.DueAmount
                })
                .ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }
        [HttpGet("product-history/{itemId}")] public async Task<IActionResult> GetProductHistory(int itemId) => Ok(await _context.ProductHistories.Where(h => h.InventoryItemId == itemId).OrderByDescending(h => h.EventDate).ToListAsync());
        [HttpGet("staff")] public async Task<IActionResult> GetStaff() => Ok(await _context.Employees.OrderBy(e => e.Name).ToListAsync());
        
        [HttpPost("stolen-report")]
        public async Task<IActionResult> ReportStolen(StolenReportRequest request)
        {
            var report = new StolenDeviceReport { ClaimId = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(), IMEI1 = request.IMEI1, IMEI2 = request.IMEI2, BrandModel = request.BrandModel, ReporterName = request.ReporterName, ReporterPhone = request.ReporterPhone, ReporterEmail = request.ReporterEmail, PoliceStation = request.PoliceStation, IsVerified = false, ReportedByComId = 1 };
            _context.StolenDeviceReports.Add(report);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Stolen device reported.", report.ClaimId });
        }

        [HttpGet("sales/{id}")]
        public async Task<IActionResult> GetSale(int id)
        {
            var sale = await _context.SalesInvoices
                .Include(s => s.Details)
                .ThenInclude(d => d.InventoryItem)
                .ThenInclude(i => i.MobileDevice)
                .FirstOrDefaultAsync(s => s.Id == id);
            
            if (sale == null) return NotFound();

            var customer = await _context.Contacts.FindAsync(sale.CustomerId);
            return Ok(new { Sale = sale, Customer = customer });
        }

        [HttpGet("purchases/{id}")]
        public async Task<IActionResult> GetPurchase(int id)
        {
            var purchase = await _context.PurchaseInvoices
                .Include(p => p.Details)
                .ThenInclude(d => d.MobileDevice)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (purchase == null) return NotFound();

            var supplier = await _context.Contacts.FindAsync(purchase.SupplierId);
            return Ok(new { Purchase = purchase, Supplier = supplier });
        }
    }
}
