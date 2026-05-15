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
            return CreatedAtAction(nameof(GetCompany), new { id = company.Id }, company);
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
    }
}
