using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stock/summary")]
        public async Task<IActionResult> GetStockSummary()
        {
            var totalImeisInStock = await _context.Inventory.CountAsync(i => !i.IsSold);
            
            var itemWiseStock = await _context.Inventory
                .Include(i => i.MobileDevice)
                .Include(i => i.Product)
                .Where(i => !i.IsSold)
                .GroupBy(i => new { i.MobileDeviceId, i.ProductId })
                .Select(g => new
                {
                    MobileDeviceId = g.Key.MobileDeviceId,
                    ProductId = g.Key.ProductId,
                    ItemName = g.First().MobileDevice != null ? g.First().MobileDevice!.ModelName : g.First().Product != null ? g.First().Product!.Name : "Unknown",
                    StockCount = g.Sum(x => x.Quantity)
                })
                .ToListAsync();

            return Ok(new
            {
                TotalImeisInStock = totalImeisInStock,
                ItemWiseStock = itemWiseStock
            });
        }

        [HttpGet("ledger/balances")]
        public async Task<IActionResult> GetLedgerBalances()
        {
            var customers = await _context.Customers
                .Select(c => new { c.Id, c.Name, c.Phone, c.CurrentBalance })
                .ToListAsync();

            var suppliers = await _context.Suppliers
                .Select(s => new { s.Id, s.Name, s.Phone, s.CurrentBalance })
                .ToListAsync();

            return Ok(new { Customers = customers, Suppliers = suppliers });
        }

        [HttpGet("employee/commissions")]
        public async Task<IActionResult> GetEmployeeCommissions()
        {
            var commissions = await _context.Employees
                .Select(e => new
                {
                    e.Id,
                    e.Name,
                    e.Designation,
                    e.TotalCommissionEarned,
                    e.TotalCommissionPaid,
                    e.CommissionBalance
                })
                .ToListAsync();

            return Ok(commissions);
        }

        [HttpGet("employee/sales-report/{employeeId}")]
        public async Task<IActionResult> GetEmployeeSalesReport(int employeeId)
        {
            var sales = await _context.SalesInvoices
                .Where(s => s.SalesPersonId == employeeId)
                .Select(s => new
                {
                    s.InvoiceNo,
                    s.SalesDate,
                    s.NetTotal,
                    TotalCommission = _context.SalesDetails.Where(d => d.SalesInvoiceId == s.Id).Sum(d => d.CommissionAmount)
                })
                .ToListAsync();

            return Ok(sales);
        }
    }
}
