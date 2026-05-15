using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CompanyController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCompanies() => Ok(await _context.Companies.ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompany(int id)
        {
            var company = await _context.Companies
                .Include(c => c.Branches)
                .FirstOrDefaultAsync(c => c.Id == id);
            
            if (company == null) return NotFound();
            return Ok(company);
        }

        [HttpPost("{id}/upload-logo")]
        public async Task<IActionResult> UploadLogo(int id, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
            
            var fileName = $"{id}_logo{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            company.LogoPath = $"/uploads/{fileName}";
            await _context.SaveChangesAsync();
            return Ok(new { Path = company.LogoPath });
        }

        [HttpPost("{id}/upload-header")]
        public async Task<IActionResult> UploadHeader(int id, IFormFile file)
        {
            if (file == null || file.Length == 0) return BadRequest("No file uploaded.");
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);
            
            var fileName = $"{id}_header{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);
            
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            company.HeaderImagePath = $"/uploads/{fileName}";
            await _context.SaveChangesAsync();
            return Ok(new { Path = company.HeaderImagePath });
        }

        [HttpPost]
        public async Task<IActionResult> CreateCompany(Company company)
        {
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();
            return Ok(company);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCompany(int id, Company company)
        {
            if (id != company.Id) return BadRequest();
            _context.Entry(company).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return NotFound();
            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPost("{id}/branches")]
        public async Task<IActionResult> CreateBranch(int id, Branch branch)
        {
            branch.ComId = id;
            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();
            return Ok(branch);
        }

        [HttpGet("{id}/export-data")]
        public async Task<IActionResult> ExportData(int id)
        {
            var contacts = await _context.Contacts.Where(c => c.ComId == id).ToListAsync();
            var products = await _context.Products.Where(p => p.ComId == id).ToListAsync();
            var mobileDevices = await _context.MobileDevices.Where(m => m.ComId == id).ToListAsync();
            var inventory = await _context.Inventory.Where(i => i.ComId == id).ToListAsync();
            var imeiItems = await _context.ImeiItems.Where(i => i.ComId == id).ToListAsync();

            return Ok(new {
                Contacts = contacts,
                Products = products,
                MobileDevices = mobileDevices,
                Inventory = inventory,
                ImeiItems = imeiItems
            });
        }

        public class CompanyDataImportDto
        {
            public List<Contact> Contacts { get; set; } = new List<Contact>();
            public List<Product> Products { get; set; } = new List<Product>();
            public List<MobileDevice> MobileDevices { get; set; } = new List<MobileDevice>();
            public List<InventoryItem> Inventory { get; set; } = new List<InventoryItem>();
            public List<ImeiItem> ImeiItems { get; set; } = new List<ImeiItem>();
        }

        [HttpPost("{id}/import-data")]
        public async Task<IActionResult> ImportData(int id, [FromBody] CompanyDataImportDto data)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // To avoid ID conflicts, we clear existing data or just insert with new IDs.
                // Assuming "backup and populate", we will insert them as new records but we must ensure we don't violate constraints.
                // Since this is a simple populate feature, we just AddRange without tracking explicit IDs.
                
                foreach (var c in data.Contacts) { c.Id = 0; c.ComId = id; }
                foreach (var p in data.Products) { p.Id = 0; p.ComId = id; }
                foreach (var m in data.MobileDevices) { m.Id = 0; m.ComId = id; }
                foreach (var inv in data.Inventory) { inv.Id = 0; inv.ComId = id; }
                foreach (var imei in data.ImeiItems) { imei.Id = 0; imei.ComId = id; }

                if (data.Contacts.Count > 0) await _context.Contacts.AddRangeAsync(data.Contacts);
                if (data.Products.Count > 0) await _context.Products.AddRangeAsync(data.Products);
                if (data.MobileDevices.Count > 0) await _context.MobileDevices.AddRangeAsync(data.MobileDevices);
                if (data.Inventory.Count > 0) await _context.Inventory.AddRangeAsync(data.Inventory);
                if (data.ImeiItems.Count > 0) await _context.ImeiItems.AddRangeAsync(data.ImeiItems);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Data imported successfully!" });
            }
            catch (System.Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
