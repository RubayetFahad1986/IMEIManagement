using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetDashboardSummary(DateTime? startDate = null, DateTime? endDate = null)
        {
            try
            {
                // Interpret input dates as local dates and convert to UTC for DB comparison
                var localStart = startDate.HasValue ? startDate.Value.Date : DateTime.Today;
                var localEnd = endDate.HasValue ? endDate.Value.Date.AddDays(1) : localStart.AddDays(1);

                var start = DateTime.SpecifyKind(localStart, DateTimeKind.Local).ToUniversalTime();
                var end = DateTime.SpecifyKind(localEnd, DateTimeKind.Local).ToUniversalTime();

                // 1. Key Metrics
                var salesQuery = _context.SalesInvoices.Where(s => s.SalesDate >= start && s.SalesDate < end && !s.IsDelete);
                var todaySales = await salesQuery.SumAsync(s => s.NetTotal);
                var todaySalesCount = await salesQuery.CountAsync();
                
                // New Metric: Today's Purchase
                var purchaseQuery = _context.PurchaseInvoices.Where(p => p.PurchaseDate >= start && p.PurchaseDate < end && !p.IsDelete);
                var todayPurchase = await purchaseQuery.SumAsync(p => p.TotalAmount);

                var totalStockValue = await _context.Inventory
                    .Where(i => !i.IsSold && !i.IsDelete)
                    .SumAsync(i => i.CostPrice);

                // Calculate Today's Expenses (Operating)
                var expenseEntriesQuery = _context.JournalEntries
                    .Include(je => je.AccountHead)
                    .ThenInclude(ah => ah.Category)
                    .Include(je => je.Voucher)
                    .Where(je => je.Voucher.VoucherDate >= start && je.Voucher.VoucherDate < end && !je.IsDelete && !je.Voucher.IsDelete)
                    .Where(je => (je.AccountHead != null && je.AccountHead.Category != null && je.AccountHead.Category.Name == "Expense") || (je.AccountHead != null && je.AccountHead.AccountType == "Expense"))
                    .Where(je => je.Voucher != null && je.Voucher.ReferenceType != "Sale" && je.Voucher.ReferenceType != "SalesReturn");

                var todayExpenses = await expenseEntriesQuery.SumAsync(je => je.Debit);
                var todayExpensesCount = await expenseEntriesQuery.Select(je => je.JournalVoucherId).Distinct().CountAsync();

                // New Metric: Today's Profit (Sales - COGS - Expenses)
                // Get COGS from the Journal Entries of today's sales
                var cogs = await _context.JournalEntries
                    .Include(je => je.AccountHead)
                    .Include(je => je.Voucher)
                    .Where(je => je.Voucher.VoucherDate >= start && je.Voucher.VoucherDate < end && !je.IsDelete && !je.Voucher.IsDelete)
                    .Where(je => je.Voucher.ReferenceType == "Sale" && je.AccountHead != null && je.AccountHead.Name == "Cost of Goods Sold")
                    .SumAsync(je => je.Debit);
                
                var todayProfit = todaySales - cogs - todayExpenses;

                // New Metric: Today's Receive (All Cash/Bank Debits from non-transfer sources)
                var todayReceive = await _context.JournalEntries
                    .Include(je => je.AccountHead)
                    .Include(je => je.Voucher)
                    .Where(je => je.Voucher.VoucherDate >= start && je.Voucher.VoucherDate < end && !je.IsDelete && !je.Voucher.IsDelete)
                    .Where(je => je.AccountHead != null && (je.AccountHead.AccountType == "Cash" || je.AccountHead.AccountType == "Bank") && je.Debit > 0 && je.Voucher.ReferenceType != "Contra")
                    .SumAsync(je => je.Debit);

                // New Metric: Today's Payment (All Cash/Bank Credits from non-transfer sources)
                var todayPayment = await _context.JournalEntries
                    .Include(je => je.AccountHead)
                    .Include(je => je.Voucher)
                    .Where(je => je.Voucher.VoucherDate >= start && je.Voucher.VoucherDate < end && !je.IsDelete && !je.Voucher.IsDelete)
                    .Where(je => je.AccountHead != null && (je.AccountHead.AccountType == "Cash" || je.AccountHead.AccountType == "Bank") && je.Credit > 0 && je.Voucher.ReferenceType != "Contra")
                    .SumAsync(je => je.Credit);

                var totalCustomers = await _context.Contacts.CountAsync(c => c.IsCustomer && !c.IsDelete);

                // 2. Account Balances (Current)
                var accountBalances = await _context.AccountHeads
                    .Include(a => a.Category)
                    .Where(a => (a.AccountType == "Cash" || a.AccountType == "Bank") && !a.IsDelete)
                    .Select(a => new { a.Name, a.AccountType, Balance = a.CurrentBalance })
                    .ToListAsync();

                // 3. Sales Trend (Last 7 Days from end date)
                var trendStart = end.AddDays(-7);
                var salesTrendRaw = await _context.SalesInvoices
                    .Where(s => s.SalesDate >= trendStart && s.SalesDate < end && !s.IsDelete)
                    .GroupBy(s => s.SalesDate.Date)
                    .Select(g => new { Date = g.Key, Amount = g.Sum(s => s.NetTotal) })
                    .ToListAsync();
                
                var salesTrend = salesTrendRaw.Select(s => new { Date = s.Date.ToString("dd MMM"), Amount = s.Amount }).ToList();

                // 4. Stock by Brand (Top 5)
                var stockByBrand = await _context.Inventory
                    .Include(i => i.MobileDevice)
                    .Where(i => !i.IsSold && !i.IsDelete && i.MobileDeviceId != null)
                    .GroupBy(i => i.MobileDevice.Brand)
                    .Select(g => new { Brand = g.Key, Count = g.Count(), Value = g.Sum(i => i.CostPrice) })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToListAsync();

                // 5. Recent Transactions
                var recentSales = await _context.SalesInvoices
                    .Where(s => !s.IsDelete)
                    .OrderByDescending(s => s.SalesDate)
                    .Take(5)
                    .Select(s => new { s.InvoiceNo, s.SalesDate, s.NetTotal, CustomerName = _context.Contacts.Where(c => c.Id == s.CustomerId).Select(c => c.Name).FirstOrDefault() })
                    .ToListAsync();

                var recentExpenses = await _context.ExpenseVouchers
                    .Where(e => !e.IsDelete)
                    .OrderByDescending(e => e.ExpenseDate)
                    .Take(5)
                    .Select(e => new { e.VoucherNo, e.ExpenseDate, e.TotalAmount, Description = e.Remarks })
                    .ToListAsync();

                return Ok(new
                {
                    metrics = new
                    {
                        todaySales,
                        todaySalesCount,
                        todayPurchase,
                        todayProfit,
                        todayReceive,
                        todayPayment,
                        stockValue = totalStockValue,
                        todayExpenses,
                        todayExpensesCount,
                        customerCount = totalCustomers
                    },
                    accountBalances,
                    charts = new { salesTrend, stockByBrand },
                    recent = new { sales = recentSales, expenses = recentExpenses }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Dashboard Error: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("stock-details")]
        public async Task<IActionResult> GetStockDetails()
        {
            var details = await _context.Inventory
                .Include(i => i.MobileDevice)
                .Include(i => i.Product)
                .Include(i => i.ImeiItem)
                .Where(i => !i.IsSold && !i.IsDelete)
                .OrderByDescending(i => i.CreateDate)
                .Select(i => new
                {
                    i.Id,
                    Brand = i.MobileDevice != null ? i.MobileDevice.Brand : (i.Product != null ? "General" : "N/A"),
                    ModelName = i.MobileDevice != null ? i.MobileDevice.ModelName : (i.Product != null ? i.Product.Name : "N/A"),
                    imei1 = i.IMEI1 ?? (i.ImeiItem != null ? i.ImeiItem.IMEI1 : ""),
                    imei2 = i.IMEI2 ?? (i.ImeiItem != null ? i.ImeiItem.IMEI2 : ""),
                    serialNumber = i.SerialNumber ?? (i.ImeiItem != null ? i.ImeiItem.SerialNumber : ""),
                    costPrice = i.CostPrice,
                    createDate = i.CreateDate,
                    variant = i.MobileDevice != null ? i.MobileDevice.RAM + "/" + i.MobileDevice.Storage : null,
                    color = i.MobileDevice != null ? i.MobileDevice.Color : null
                })
                .ToListAsync();

            return Ok(details);
        }
    }
}
