using Microsoft.AspNetCore.Mvc;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Repositories;
using System.Threading.Tasks;
using System.Linq;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly IRepository<Brand> _brandRepo;
        private readonly IRepository<Branch> _branchRepo;
        private readonly IRepository<Contact> _contactRepo;
        private readonly IRepository<AccountHead> _accountRepo;
        private readonly IRepository<MobileDevice> _deviceRepo;
        private readonly IRepository<Product> _productRepo;
        private readonly IRepository<ProductCategory> _categoryRepo;

        public SetupController(
            IRepository<Brand> brandRepo,
            IRepository<Branch> branchRepo,
            IRepository<Contact> contactRepo,
            IRepository<AccountHead> accountRepo,
            IRepository<MobileDevice> deviceRepo,
            IRepository<Product> productRepo,
            IRepository<ProductCategory> categoryRepo)
        {
            _brandRepo = brandRepo;
            _branchRepo = branchRepo;
            _contactRepo = contactRepo;
            _accountRepo = accountRepo;
            _deviceRepo = deviceRepo;
            _productRepo = productRepo;
            _categoryRepo = categoryRepo;
        }

        // --- Product CRUD ---
        [HttpGet("products")] public async Task<IActionResult> GetProducts() => Ok(await _productRepo.GetAllAsync());
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
        [HttpGet("mobile-devices")] public async Task<IActionResult> GetMobileDevices() => Ok(await _deviceRepo.GetAllAsync());
        [HttpPost("mobile-devices")] public async Task<IActionResult> CreateMobileDevice(MobileDevice device) { device.ComId = 1; await _deviceRepo.AddAsync(device); return Ok(device); }
        [HttpPut("mobile-devices")] public async Task<IActionResult> UpdateMobileDevice(MobileDevice device) { _deviceRepo.Update(device); return Ok(device); }
        [HttpDelete("mobile-devices/{id}")] public async Task<IActionResult> DeleteMobileDevice(int id) { var d = await _deviceRepo.GetByIdAsync(id); if (d != null) _deviceRepo.Delete(d); return Ok(); }

        // --- Branch CRUD ---
        [HttpGet("branches")] public async Task<IActionResult> GetBranches() => Ok(await _branchRepo.GetAllAsync());
        [HttpPost("branches")] public async Task<IActionResult> CreateBranch(Branch branch) { branch.ComId = 1; await _branchRepo.AddAsync(branch); return Ok(branch); }
        [HttpPut("branches")] public async Task<IActionResult> UpdateBranch(Branch branch) { _branchRepo.Update(branch); return Ok(branch); }
        [HttpDelete("branches/{id}")] public async Task<IActionResult> DeleteBranch(int id) { var b = await _branchRepo.GetByIdAsync(id); if (b != null) _branchRepo.Delete(b); return Ok(); }

        // --- Contact (Unified Customer/Supplier) CRUD ---
        [HttpGet("contacts")] public async Task<IActionResult> GetContacts() => Ok(await _contactRepo.GetAllAsync());
        
        [HttpGet("suppliers")] 
        public async Task<IActionResult> GetSuppliers() => Ok((await _contactRepo.GetAllAsync()).Where(c => c.IsSupplier));
        
        [HttpGet("customers")] 
        public async Task<IActionResult> GetCustomers() => Ok((await _contactRepo.GetAllAsync()).Where(c => c.IsCustomer));

        [HttpPost("contacts")] 
        public async Task<IActionResult> CreateContact(Contact contact) { contact.ComId = 1; await _contactRepo.AddAsync(contact); return Ok(contact); }
        
        [HttpPut("contacts")] 
        public async Task<IActionResult> UpdateContact(Contact contact) { _contactRepo.Update(contact); return Ok(contact); }
        
        [HttpDelete("contacts/{id}")] 
        public async Task<IActionResult> DeleteContact(int id) { var c = await _contactRepo.GetByIdAsync(id); if (c != null) _contactRepo.Delete(c); return Ok(); }

        // --- AccountHead CRUD ---
        [HttpGet("accounts")] public async Task<IActionResult> GetAccounts() => Ok(await _accountRepo.GetAllAsync());
        [HttpPost("accounts")] public async Task<IActionResult> CreateAccount(AccountHead a) { a.ComId = 1; await _accountRepo.AddAsync(a); return Ok(a); }
        [HttpPut("accounts")] public async Task<IActionResult> UpdateAccount(AccountHead a) { _accountRepo.Update(a); return Ok(a); }
        [HttpDelete("accounts/{id}")] public async Task<IActionResult> DeleteAccount(int id) { var a = await _accountRepo.GetByIdAsync(id); if (a != null) _accountRepo.Delete(a); return Ok(); }
    }
}
