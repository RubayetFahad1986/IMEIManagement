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
        public async Task<IActionResult> GetDashboardSummary()
        {
            var today = DateTime.UtcNow.Date;
            var startOfMonth = new DateTime(today.Year, today.Month, 1);

            // 1. Key Metrics
            var todaySales = await _context.SalesInvoices
                .Where(s => s.SalesDate.Date == today && !s.IsDelete)
                .SumAsync(s => s.NetTotal);

            var totalStockValue = await _context.Inventory
                .Where(i => !i.IsSold && !i.IsDelete)
                .SumAsync(i => i.CostPrice);

            var todayExpenses = await _context.ExpenseVouchers
                .Where(e => e.ExpenseDate.Date == today && !e.IsDelete)
                .SumAsync(e => e.TotalAmount);

            var totalCustomers = await _context.Contacts.CountAsync(c => c.IsCustomer && !c.IsDelete);

            // 2. Account Balances (Cash & Bank)
            var accountBalances = await _context.AccountHeads
                .Include(a => a.Category)
                .Where(a => (a.AccountType == "Cash" || a.AccountType == "Bank") && !a.IsDelete)
                .Select(a => new
                {
                    a.Name,
                    a.AccountType,
                    Balance = a.CurrentBalance
                })
                .ToListAsync();

            // 3. Sales Trend (Last 7 Days)
            var salesTrend = await _context.SalesInvoices
                .Where(s => s.SalesDate >= today.AddDays(-6) && !s.IsDelete)
                .GroupBy(s => s.SalesDate.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("dd MMM"),
                    Amount = g.Sum(s => s.NetTotal)
                })
                .ToListAsync();

            // 4. Stock by Brand (Top 5)
            var stockByBrand = await _context.Inventory
                .Include(i => i.MobileDevice)
                .Where(i => !i.IsSold && !i.IsDelete && i.MobileDeviceId != null)
                .GroupBy(i => i.MobileDevice.Brand)
                .Select(g => new
                {
                    Brand = g.Key,
                    Count = g.Count(),
                    Value = g.Sum(i => i.CostPrice)
                })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // 5. Recent Transactions
            var recentSales = await _context.SalesInvoices
                .Where(s => !s.IsDelete)
                .OrderByDescending(s => s.SalesDate)
                .Take(5)
                .Select(s => new
                {
                    s.InvoiceNo,
                    s.SalesDate,
                    s.NetTotal,
                    CustomerName = _context.Contacts.Where(c => c.Id == s.CustomerId).Select(c => c.Name).FirstOrDefault()
                })
                .ToListAsync();

            var recentExpenses = await _context.ExpenseVouchers
                .Where(e => !e.IsDelete)
                .OrderByDescending(e => e.ExpenseDate)
                .Take(5)
                .Select(e => new
                {
                    e.VoucherNo,
                    e.ExpenseDate,
                    e.TotalAmount,
                    Description = e.Remarks
                })
                .ToListAsync();

            return Ok(new
            {
                Metrics = new
                {
                    TodaySales = todaySales,
                    StockValue = totalStockValue,
                    TodayExpenses = todayExpenses,
                    CustomerCount = totalCustomers
                },
                AccountBalances = accountBalances,
                Charts = new
                {
                    SalesTrend = salesTrend,
                    StockByBrand = stockByBrand
                },
                Recent = new
                {
                    Sales = recentSales,
                    Expenses = recentExpenses
                }
            });
        }
    }
}
