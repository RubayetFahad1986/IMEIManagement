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
                        BranchId = 1, // Default to main branch
                        ComId = 1
                    };
                    _context.Inventory.Add(invItem);
                    await _context.SaveChangesAsync(); // Save to get invItem.Id for history

                    await LogProductHistory(invItem.Id, "Purchase", request.InvoiceNo, $"Purchased from supplier ID {request.SupplierId}", null, 1);
                }

                invoice.TotalAmount = totalCost;
                invoice.DueAmount = totalCost - request.PaidAmount;
                _context.PurchaseInvoices.Add(invoice);
                await _context.SaveChangesAsync(); // save to get invoice.Id

                // === Accounting Logic ===
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

                // Debit Inventory, Credit AP
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = totalCost, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = 0, Credit = totalCost, ComId = 1 });

                // If Paid, Debit AP, Credit Cash
                if (request.PaidAmount > 0)
                {
                    jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.PaidAmount, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = 0, Credit = request.PaidAmount, ComId = 1 });
                }
                _context.JournalVouchers.Add(jv);

                // === Supplier Ledger ===
                var supplier = await _context.Suppliers.FindAsync(request.SupplierId);
                if (supplier != null)
                {
                    supplier.CurrentBalance += invoice.DueAmount;
                    
                    _context.SupplierLedgers.Add(new SupplierLedger
                    {
                        SupplierId = request.SupplierId,
                        TransactionDate = DateTime.UtcNow,
                        Description = $"Purchase Invoice {invoice.InvoiceNo}",
                        ReferenceNo = invoice.InvoiceNo,
                        Credit = totalCost,
                        Debit = request.PaidAmount,
                        Balance = supplier.CurrentBalance,
                        ComId = 1
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Purchase recorded, inventory updated, and journal entries posted.", InvoiceId = invoice.Id });
            }
            catch(Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest($"Error: {ex.Message}");
            }
        }

        [HttpPost("sales")]
        public async Task<IActionResult> CreateSale(SalesRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var itemIds = request.Items.Select(i => i.InventoryItemId).ToList();
                var items = await _context.Inventory
                    .Where(i => itemIds.Contains(i.Id) && !i.IsSold)
                    .ToListAsync();

                if (items.Count != request.Items.Count)
                    return BadRequest("One or more items are already sold or not found.");

                decimal totalExchangeCredit = 0;
                if (request.IsExchange && request.ReturningInventoryItemIds.Any())
                {
                    var returningItems = await _context.Inventory
                        .Where(i => request.ReturningInventoryItemIds.Contains(i.Id))
                        .ToListAsync();

                    foreach (var rItem in returningItems)
                    {
                        rItem.IsSold = false;
                        totalExchangeCredit += request.ExchangeValue / returningItems.Count;
                        await LogProductHistory(rItem.Id, "ExchangeReturn", "EXC-" + DateTime.UtcNow.Ticks, "Returned via exchange window");
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

                decimal subtotal = 0;
                decimal totalCostOfGoods = 0;
                decimal totalCommission = 0;

                foreach (var itemReq in request.Items)
                {
                    var item = items.First(i => i.Id == itemReq.InventoryItemId);
                    subtotal += item.CurrentSalePrice;
                    totalCostOfGoods += item.CostPrice;
                    totalCommission += item.CommissionAmount;
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

                    await LogProductHistory(item.Id, "Sale", invoice.InvoiceNo, $"Sold to customer ID {request.CustomerId}", item.BranchId, null);
                }

                invoice.SubTotal = subtotal;
                invoice.NetTotal = subtotal - request.Discount - totalExchangeCredit;
                invoice.ChangeAmount = Math.Max(0, request.PaidAmount - invoice.NetTotal);

                _context.SalesInvoices.Add(invoice);
                await _context.SaveChangesAsync();

                // === Commission Earning ===
                if (request.SalesPersonId.HasValue && totalCommission > 0)
                {
                    var employee = await _context.Employees.FindAsync(request.SalesPersonId.Value);
                    if (employee != null)
                    {
                        employee.TotalCommissionEarned += totalCommission;
                        _context.EmployeeCommissions.Add(new EmployeeCommission
                        {
                            EmployeeId = employee.Id,
                            SalesInvoiceId = invoice.Id,
                            TransactionDate = DateTime.UtcNow,
                            TransactionType = "Earning",
                            Amount = totalCommission,
                            Remarks = $"Commission from Sale {invoice.InvoiceNo}",
                            ComId = 1
                        });
                    }
                }

                // === Accounting Logic ===
                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset");
                int salesAccId = await GetOrCreateAccountAsync("Sales Revenue", "Income");
                int cogsAccId = await GetOrCreateAccountAsync("Cost of Goods Sold", "Expense");
                int invAccId = await GetOrCreateAccountAsync("Inventory", "Asset");
                int cashAccId = await GetOrCreateAccountAsync("Cash In Hand", "Cash");

                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-SAL-" + invoice.Id,
                    VoucherDate = DateTime.UtcNow,
                    ReferenceType = request.IsExchange ? "Exchange" : "Sale",
                    ReferenceNo = invoice.InvoiceNo,
                    ComId = 1
                };

                jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = invoice.NetTotal, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = salesAccId, Debit = 0, Credit = subtotal - request.Discount, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = cogsAccId, Debit = totalCostOfGoods, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = invAccId, Debit = 0, Credit = totalCostOfGoods, ComId = 1 });

                if (request.PaidAmount > 0)
                {
                    decimal actualPaid = Math.Min(request.PaidAmount, invoice.NetTotal);
                    jv.Entries.Add(new JournalEntry { AccountHeadId = cashAccId, Debit = actualPaid, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = actualPaid, ComId = 1 });
                }
                _context.JournalVouchers.Add(jv);

                // === Customer Ledger ===
                if (request.CustomerId.HasValue)
                {
                    var customer = await _context.Customers.FindAsync(request.CustomerId.Value);
                    if (customer != null)
                    {
                        decimal dueFromThisSale = invoice.NetTotal - Math.Min(request.PaidAmount, invoice.NetTotal);
                        customer.CurrentBalance += dueFromThisSale;
                        
                        _context.CustomerLedgers.Add(new CustomerLedger
                        {
                            CustomerId = request.CustomerId.Value,
                            TransactionDate = DateTime.UtcNow,
                            Description = $"Sales Invoice {invoice.InvoiceNo}",
                            ReferenceNo = invoice.InvoiceNo,
                            Debit = invoice.NetTotal,
                            Credit = Math.Min(request.PaidAmount, invoice.NetTotal),
                            Balance = customer.CurrentBalance,
                            ComId = 1
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Sale completed, commissions and accounting updated.", InvoiceId = invoice.Id });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("employee/pay-commission")]
        public async Task<IActionResult> PayCommission(CommissionPaymentRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var employee = await _context.Employees.FindAsync(request.EmployeeId);
                if (employee == null) return NotFound("Employee not found.");

                if (request.Amount > employee.CommissionBalance)
                    return BadRequest("Insufficient commission balance.");

                employee.TotalCommissionPaid += request.Amount;

                _context.EmployeeCommissions.Add(new EmployeeCommission
                {
                    EmployeeId = employee.Id,
                    TransactionDate = DateTime.UtcNow,
                    TransactionType = "Payment",
                    Amount = request.Amount,
                    Remarks = request.Remarks,
                    ComId = 1
                });

                // === Journal Voucher ===
                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-COMMPAY-" + DateTime.UtcNow.Ticks,
                    VoucherDate = DateTime.UtcNow,
                    ReferenceType = "CommissionPayment",
                    ReferenceNo = employee.Name,
                    ComId = 1
                };

                // Debit Commission Expense (or Staff Salary/Liability)
                int staffSalaryAccId = await GetOrCreateAccountAsync("Staff Salary", "Expense");
                jv.Entries.Add(new JournalEntry { AccountHeadId = staffSalaryAccId, Debit = request.Amount, Credit = 0, ComId = 1 });

                // Credit Payment Account (Cash/Bank)
                jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = 0, Credit = request.Amount, ComId = 1 });

                _context.JournalVouchers.Add(jv);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Commission payment processed." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("warranty/status/{imei}")]
        public async Task<IActionResult> GetWarrantyStatus(string imei)
        {
            var item = await _context.Inventory
                .Include(i => i.MobileDevice)
                .FirstOrDefaultAsync(i => i.IMEI1 == imei || i.IMEI2 == imei);

            if (item == null) return NotFound("IMEI not found.");
            if (!item.IsSold) return Ok(new { IsSold = false, Message = "Device is still in stock." });

            var remainingDays = (item.WarrantyExpiryDate.HasValue) 
                ? (item.WarrantyExpiryDate.Value - DateTime.UtcNow).Days 
                : 0;

            return Ok(new {
                item.IMEI1,
                Device = item.MobileDevice?.ModelName,
                ExpiryDate = item.WarrantyExpiryDate,
                RemainingDays = Math.Max(0, remainingDays),
                IsActive = remainingDays > 0
            });
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventory()
        {
            var inventory = await _context.Inventory
                .Include(i => i.MobileDevice)
                .OrderByDescending(i => i.Id)
                .ToListAsync();
            return Ok(inventory);
        }

        [HttpGet("product-history/{itemId}")]
        public async Task<IActionResult> GetProductHistory(int itemId)
        {
            var history = await _context.ProductHistories
                .Where(h => h.InventoryItemId == itemId)
                .OrderByDescending(h => h.EventDate)
                .ToListAsync();
            return Ok(history);
        }

        [HttpPost("stolen-report")]
        public async Task<IActionResult> ReportStolen(StolenReportRequest request)
        {
            var report = new StolenDeviceReport
            {
                ClaimId = Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
                IMEI1 = request.IMEI1,
                IMEI2 = request.IMEI2,
                BrandModel = request.BrandModel,
                ReporterName = request.ReporterName,
                ReporterPhone = request.ReporterPhone,
                ReporterEmail = request.ReporterEmail,
                PoliceStation = request.PoliceStation,
                IsVerified = false,
                ReportedByComId = 1 // Logic to get current tenant
            };
            _context.StolenDeviceReports.Add(report);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Stolen device reported.", ClaimId = report.ClaimId });
        }

        [HttpGet("stolen-check/{imei}")]
        public async Task<IActionResult> CheckStolen(string imei)
        {
            var report = await _context.StolenDeviceReports
                .FirstOrDefaultAsync(r => r.IMEI1 == imei || r.IMEI2 == imei);

            if (report == null) return Ok(new { IsStolen = false });

            return Ok(new
            {
                IsStolen = true,
                report.BrandModel,
                report.IsVerified,
                report.ReporterPhone,
                Message = report.IsVerified ? "WARNING: This device is verified as STOLEN." : "CAUTION: This device has been reported as stolen but not yet verified."
            });
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff()
        {
            var staff = await _context.Employees
                .OrderBy(e => e.Name)
                .ToListAsync();
            return Ok(staff);
        }
    }
}
