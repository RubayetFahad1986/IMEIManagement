using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PublicController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PublicController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("stolen-check/{imei}")]
        public async Task<IActionResult> CheckStolen(string imei)
        {
            // Bypassing global filters to search across all companies
            var report = await _context.StolenDeviceReports
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(r => (r.IMEI1 == imei || r.IMEI2 == imei) && !r.IsDelete);

            if (report == null)
            {
                return Ok(new 
                { 
                    IsStolen = false, 
                    Message = "No record found for this IMEI. However, always verify the source of the device." 
                });
            }

            return Ok(new
            {
                IsStolen = true,
                report.BrandModel,
                report.IsVerified,
                Status = report.IsVerified ? "Verified Stolen" : "Reported Lost",
                Message = report.IsVerified 
                    ? "CRITICAL: This device is verified as STOLEN. Please contact local authorities." 
                    : "CAUTION: This device has been reported as lost by its owner."
            });
        }
    }
}
