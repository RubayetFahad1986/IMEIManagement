using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Infrastructure.Repositories;
using System.Threading.Tasks;
using System.Linq;
using BCrypt.Net;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IRepository<Brand> _brandRepo;
        private readonly IRepository<Branch> _branchRepo;
        private readonly IRepository<Contact> _contactRepo;
        private readonly IRepository<AccountHead> _accountRepo;
        private readonly IRepository<MobileDevice> _deviceRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<ProductCategory> _categoryRepo;
        private readonly IRepository<Employee> _employeeRepo;

        public SetupController(
            ApplicationDbContext context,
            IRepository<Brand> brandRepo,
            IRepository<Branch> branchRepo,
            IRepository<Contact> contactRepo,
            IRepository<AccountHead> accountRepo,
            IRepository<MobileDevice> deviceRepo,
            IRepository<Product> productRepo,
            IRepository<ProductCategory> categoryRepo,
            IRepository<Employee> employeeRepo)
        {
            _context = context;
            _brandRepo = brandRepo;
            _branchRepo = branchRepo;
            _contactRepo = contactRepo;
            _accountRepo = accountRepo;
            _deviceRepo = deviceRepo;
            _productRepo = productRepo;
            _categoryRepo = categoryRepo;
            _employeeRepo = employeeRepo;
        }

        // --- Product CRUD ---
        [HttpGet("products")]
        public async Task<IActionResult> GetProducts(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<Product> query = _context.Products;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(search) || (p.SKU != null && p.SKU.ToLower().Contains(search)));
            }
            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(p => p.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }

        [HttpPost("products")] public async Task<IActionResult> CreateProduct(Product product) { product.ComId = 1; await _productRepo.AddAsync(product); return Ok(product); }
        [HttpPut("products")] public async Task<IActionResult> UpdateProduct(Product product) { _productRepo.Update(product); return Ok(product); }
        [HttpDelete("products/{id}")] public async Task<IActionResult> DeleteProduct(int id) { var p = await _productRepo.GetByIdAsync(id); if (p != null) _productRepo.Delete(p); return Ok(); }

        // --- ProductCategory CRUD ---
        [HttpGet("categories")] public async Task<IActionResult> GetProductCategories() => Ok(await _categoryRepo.GetAllAsync());
        [HttpPost("categories")] public async Task<IActionResult> CreateProductCategory(ProductCategory cat) { cat.ComId = 1; await _categoryRepo.AddAsync(cat); return Ok(cat); }

        // --- Brand CRUD ---
        [HttpGet("brands")] public async Task<IActionResult> GetBrands() => Ok(await _brandRepo.GetAllAsync());
        [HttpPost("brands")] public async Task<IActionResult> CreateBrand(Brand brand) { brand.ComId = 1; await _brandRepo.AddAsync(brand); return Ok(brand); }
        [HttpPut("brands")] public async Task<IActionResult> UpdateBrand(Brand brand) { _brandRepo.Update(brand); return Ok(brand); }
        [HttpDelete("brands/{id}")] public async Task<IActionResult> DeleteBrand(int id) { var b = await _brandRepo.GetByIdAsync(id); if (b != null) _brandRepo.Delete(b); return Ok(); }

        // --- MobileDevice CRUD ---
        [HttpGet("mobile-devices")]
        public async Task<IActionResult> GetMobileDevices(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<MobileDevice> query = _context.MobileDevices;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(d => d.Brand.ToLower().Contains(search) || d.ModelName.ToLower().Contains(search));
            }
            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(d => d.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }
        
        [HttpPost("mobile-devices")] public async Task<IActionResult> CreateMobileDevice(MobileDevice device) { device.ComId = 1; await _deviceRepo.AddAsync(device); return Ok(device); }
        [HttpPut("mobile-devices")] public async Task<IActionResult> UpdateMobileDevice(MobileDevice device) { _deviceRepo.Update(device); return Ok(device); }
        [HttpDelete("mobile-devices/{id}")] public async Task<IActionResult> DeleteMobileDevice(int id) { var d = await _deviceRepo.GetByIdAsync(id); if (d != null) _deviceRepo.Delete(d); return Ok(); }

        // --- Branch CRUD ---
        [HttpGet("branches")] public async Task<IActionResult> GetBranches() => Ok(await _branchRepo.GetAllAsync());
        [HttpPost("branches")] public async Task<IActionResult> CreateBranch(Branch branch) { branch.ComId = 1; await _branchRepo.AddAsync(branch); return Ok(branch); }
        [HttpPut("branches")] public async Task<IActionResult> UpdateBranch(Branch branch) { _branchRepo.Update(branch); return Ok(branch); }
        [HttpDelete("branches/{id}")] public async Task<IActionResult> DeleteBranch(int id) { var b = await _branchRepo.GetByIdAsync(id); if (b != null) _branchRepo.Delete(b); return Ok(); }

        // --- Contact (Unified Customer/Supplier) CRUD ---
        [HttpGet("contacts")]
        public async Task<IActionResult> GetContacts(int page = 1, int pageSize = 10, string? search = null, bool? isCustomer = null, bool? isSupplier = null)
        {
            IQueryable<Contact> query = _context.Contacts;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(c => c.Name.ToLower().Contains(search) || c.Phone.ToLower().Contains(search));
            }
            if (isCustomer.HasValue) query = query.Where(c => c.IsCustomer == isCustomer.Value);
            if (isSupplier.HasValue) query = query.Where(c => c.IsSupplier == isSupplier.Value);

            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(c => c.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }
        
        [HttpGet("suppliers")] 
        public async Task<IActionResult> GetSuppliers() => Ok(await _contactRepo.FindAsync(c => c.IsSupplier));
        
        [HttpGet("customers")] 
        public async Task<IActionResult> GetCustomers() => Ok(await _contactRepo.FindAsync(c => c.IsCustomer));

        [HttpPost("contacts")] 
        public async Task<IActionResult> CreateContact(Contact contact) { contact.ComId = 1; await _contactRepo.AddAsync(contact); return Ok(contact); }
        
        [HttpPut("contacts")] 
        public async Task<IActionResult> UpdateContact(Contact contact) { _contactRepo.Update(contact); return Ok(contact); }
        
        [HttpDelete("contacts/{id}")] 
        public async Task<IActionResult> DeleteContact(int id) { var c = await _contactRepo.GetByIdAsync(id); if (c != null) _contactRepo.Delete(c); return Ok(); }

        [HttpGet("contacts/search/{phone}")]
        public async Task<IActionResult> SearchContactsByPhone(string phone)
        {
            var contacts = await _contactRepo.GetAllAsync();
            var matched = contacts.Where(c => c.Phone.Contains(phone)).Take(5);
            return Ok(matched);
        }

        // --- User CRUD ---
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<User> query = _context.Users;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(u => u.Username.ToLower().Contains(search) || u.FullName.ToLower().Contains(search));
            }
            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(u => u.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser(User user)
        {
            if (await _context.Users.AnyAsync(u => u.Username == user.Username)) return BadRequest("Username already exists.");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"); // Default password
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPut("users")]
        public async Task<IActionResult> UpdateUser(User user)
        {
            var existing = await _context.Users.FindAsync(user.Id);
            if (existing == null) return NotFound();
            existing.FullName = user.FullName;
            existing.Email = user.Email;
            existing.Role = user.Role;
            existing.BranchId = user.BranchId;
            existing.IsActive = user.IsActive;
            existing.IsShowCosting = user.IsShowCosting;
            existing.CanSeeOthersEntry = user.CanSeeOthersEntry;
            await _context.SaveChangesAsync();
            return Ok(existing);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var u = await _context.Users.FindAsync(id);
            if (u != null) { _context.Users.Remove(u); await _context.SaveChangesAsync(); }
            return Ok();
        }
        [HttpGet("staff")]
        public async Task<IActionResult> GetStaff(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<Employee> query = _context.Employees;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(e => e.Name.ToLower().Contains(search) || e.Phone.ToLower().Contains(search));
            }
            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(e => e.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }
        [HttpPost("staff")] public async Task<IActionResult> CreateStaff(Employee emp) { emp.ComId = 1; await _employeeRepo.AddAsync(emp); return Ok(emp); }
        [HttpPut("staff")] public async Task<IActionResult> UpdateStaff(Employee emp) { _employeeRepo.Update(emp); return Ok(emp); }
        [HttpDelete("staff/{id}")] public async Task<IActionResult> DeleteStaff(int id) { var e = await _employeeRepo.GetByIdAsync(id); if (e != null) _employeeRepo.Delete(e); return Ok(); }

        // --- AccountHead CRUD ---
        [HttpGet("accounts")]
        public async Task<IActionResult> GetAccounts(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<AccountHead> query = _context.AccountHeads;
            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(a => a.Name.ToLower().Contains(search));
            }
            int totalCount = await query.CountAsync();
            var items = await query.OrderByDescending(a => a.Id).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new { Items = items, TotalCount = totalCount, PageNumber = page, PageSize = pageSize, TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize) });
        }
        [HttpPost("accounts")] public async Task<IActionResult> CreateAccount(AccountHead a) { a.ComId = 1; await _accountRepo.AddAsync(a); return Ok(a); }
        [HttpPut("accounts")] public async Task<IActionResult> UpdateAccount(AccountHead a) { _accountRepo.Update(a); return Ok(a); }
        [HttpDelete("accounts/{id}")] public async Task<IActionResult> DeleteAccount(int id) { var a = await _accountRepo.GetByIdAsync(id); if (a != null) _accountRepo.Delete(a); return Ok(); }
    }
}
