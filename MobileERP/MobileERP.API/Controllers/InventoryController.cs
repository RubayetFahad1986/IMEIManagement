using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllInventory()
        {
            var inventory = await _context.Inventory
                .Include(i => i.MobileDevice)
                .Include(i => i.Product)
                .Where(i => !i.IsSold && !i.IsDelete)
                .Select(i => new
                {
                    i.Id,
                    i.BranchId,
                    DeviceName = i.MobileDevice != null ? i.MobileDevice.Brand + " " + i.MobileDevice.ModelName : (i.Product != null ? i.Product.Name : "Unknown"),
                    i.IMEI1,
                    i.IMEI2,
                    i.SerialNumber,
                    i.Condition,
                    i.CurrentSalePrice,
                    i.Quantity
                })
                .ToListAsync();

            return Ok(inventory);
        }

        [HttpGet("by-branch/{branchId}")]
        public async Task<IActionResult> GetInventoryByBranch(int branchId)
        {
            var inventory = await _context.Inventory
                .Include(i => i.MobileDevice)
                .Include(i => i.Product)
                .Where(i => i.BranchId == branchId && !i.IsSold && !i.IsDelete)
                .Select(i => new
                {
                    i.Id,
                    DeviceName = i.MobileDevice != null ? i.MobileDevice.Brand + " " + i.MobileDevice.ModelName : (i.Product != null ? i.Product.Name : "Unknown"),
                    i.IMEI1,
                    i.IMEI2,
                    i.SerialNumber,
                    i.Condition,
                    i.CurrentSalePrice,
                    i.Quantity
                })
                .ToListAsync();

            return Ok(inventory);
        }
    }
}
