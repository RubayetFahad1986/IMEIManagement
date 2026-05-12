using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;

namespace MobileERP.Infrastructure.Services
{
    public class DataSeeder
    {
        private readonly ApplicationDbContext _context;

        public DataSeeder(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task SeedMobileDevicesAsync(string csvFilePath)
        {
            if (await _context.MobileDevices.AnyAsync()) return;

            var devices = new List<MobileDevice>
            {
                // Samsung
                new MobileDevice { Brand = "Samsung", ModelName = "Galaxy S24 Ultra", Color = "Titanium Gray", RAM = "12GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 145000, DefaultSalesPrice = 159999 },
                new MobileDevice { Brand = "Samsung", ModelName = "Galaxy A55", Color = "Awesome Navy", RAM = "8GB", Storage = "128GB", IsOfficial = true, DefaultCostPrice = 45000, DefaultSalesPrice = 49999 },
                new MobileDevice { Brand = "Samsung", ModelName = "Galaxy M15", Color = "Dark Blue", RAM = "6GB", Storage = "128GB", IsOfficial = true, DefaultCostPrice = 18500, DefaultSalesPrice = 21999 },
                
                // Xiaomi
                new MobileDevice { Brand = "Xiaomi", ModelName = "Redmi Note 13 Pro", Color = "Midnight Black", RAM = "8GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 32000, DefaultSalesPrice = 35999 },
                new MobileDevice { Brand = "Xiaomi", ModelName = "Poco X6 Pro", Color = "Yellow", RAM = "12GB", Storage = "512GB", IsOfficial = true, DefaultCostPrice = 42000, DefaultSalesPrice = 46999 },
                new MobileDevice { Brand = "Xiaomi", ModelName = "Redmi 13C", Color = "Clover Green", RAM = "6GB", Storage = "128GB", IsOfficial = true, DefaultCostPrice = 13000, DefaultSalesPrice = 15499 },
                
                // Vivo
                new MobileDevice { Brand = "Vivo", ModelName = "V30", Color = "Peacock Green", RAM = "12GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 54000, DefaultSalesPrice = 59999 },
                new MobileDevice { Brand = "Vivo", ModelName = "Y28", Color = "Gleaming Orange", RAM = "8GB", Storage = "128GB", IsOfficial = true, DefaultCostPrice = 19500, DefaultSalesPrice = 22999 },
                
                // Oppo
                new MobileDevice { Brand = "Oppo", ModelName = "Reno 11", Color = "Wave Green", RAM = "12GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 41000, DefaultSalesPrice = 45999 },
                new MobileDevice { Brand = "Oppo", ModelName = "A60", Color = "Blue", RAM = "8GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 21000, DefaultSalesPrice = 24999 },
                
                // iPhone
                new MobileDevice { Brand = "Apple", ModelName = "iPhone 15 Pro Max", Color = "Natural Titanium", RAM = "8GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 165000, DefaultSalesPrice = 185000 },
                new MobileDevice { Brand = "Apple", ModelName = "iPhone 13", Color = "Midnight", RAM = "4GB", Storage = "128GB", IsOfficial = true, DefaultCostPrice = 65000, DefaultSalesPrice = 72000 },
                
                // Realme
                new MobileDevice { Brand = "Realme", ModelName = "12 Pro+", Color = "Submarine Blue", RAM = "12GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 44000, DefaultSalesPrice = 48999 },
                new MobileDevice { Brand = "Realme", ModelName = "C67", Color = "Sunny Oasis", RAM = "8GB", Storage = "128GB", IsOfficial = true, DefaultCostPrice = 19000, DefaultSalesPrice = 22499 }
            };

            await _context.MobileDevices.AddRangeAsync(devices);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Successfully seeded {devices.Count} mobile devices with BDT prices.");
        }

        public async Task SeedAccountHeadsAsync()
        {
            if (await _context.AccountCategories.AnyAsync()) return;

            var categories = new List<AccountCategory>
            {
                new AccountCategory { Name = "Assets", Code = "100" },
                new AccountCategory { Name = "Liabilities", Code = "200" },
                new AccountCategory { Name = "Equity", Code = "300" },
                new AccountCategory { Name = "Income", Code = "400" },
                new AccountCategory { Name = "Expense", Code = "500" }
            };

            await _context.AccountCategories.AddRangeAsync(categories);
            await _context.SaveChangesAsync();

            var heads = new List<AccountHead>();
            
            var assetId = categories.First(c => c.Name == "Assets").Id;
            heads.Add(new AccountHead { Name = "Cash In Hand", AccountCategoryId = assetId, AccountType = "Cash", IsDefault = true, ComId = 1 });
            heads.Add(new AccountHead { Name = "City Bank Ltd", AccountCategoryId = assetId, AccountType = "Bank", IsDefault = true, ComId = 1 });
            heads.Add(new AccountHead { Name = "bKash Merchant", AccountCategoryId = assetId, AccountType = "Bank", IsDefault = true, ComId = 1 });
            heads.Add(new AccountHead { Name = "Inventory", AccountCategoryId = assetId, AccountType = "General", IsDefault = true, ComId = 1 });

            var expenseId = categories.First(c => c.Name == "Expense").Id;
            heads.Add(new AccountHead { Name = "Shop Rent", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true, ComId = 1 });
            heads.Add(new AccountHead { Name = "Staff Salary", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true, ComId = 1 });
            heads.Add(new AccountHead { Name = "Cost of Goods Sold", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true, ComId = 1 });

            var incomeId = categories.First(c => c.Name == "Income").Id;
            heads.Add(new AccountHead { Name = "Sales Revenue", AccountCategoryId = incomeId, AccountType = "General", IsDefault = true, ComId = 1 });

            await _context.AccountHeads.AddRangeAsync(heads);
            await _context.SaveChangesAsync();
        }

        public async Task SeedAdminUserAsync()
        {
            var admin = await _context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
            if (admin != null)
            {
                if (admin.PasswordHash == "Admin123")
                {
                    admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123");
                    await _context.SaveChangesAsync();
                }
                return;
            }

            admin = new User { Username = "admin", Email = "Admin@gmail.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"), FullName = "Super Administrator", Role = "SuperAdmin", IsActive = true };
            _context.Users.Add(admin);
            await _context.SaveChangesAsync();
        }

        public async Task SeedCompanyAsync()
        {
            if (await _context.Companies.AnyAsync()) return;

            var company = new Company { Name = "Dominate Software Solution", Address = "Dhaka, Bangladesh", Phone = "+8801700000000", Email = "info@dominate.com", IsActive = true };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var branch = new Branch { Name = "Main Branch", Address = "Head Office, Dhaka", Phone = "+8801700000000", IsMainBranch = true, ComId = company.Id };
            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();
        }
    }
}
