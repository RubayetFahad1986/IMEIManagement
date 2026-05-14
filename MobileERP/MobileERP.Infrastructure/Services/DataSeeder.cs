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

        public async Task FixSchemaDriftAsync()
        {
            try
            {
                // Drop stray columns from early migrations that are no longer in the entity models
                // but still have NOT NULL constraints causing failures.
                await _context.Database.ExecuteSqlRawAsync(@"
                    DO $$ 
                    BEGIN 
                        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PurchaseDetails' AND column_name='IMEI1') THEN
                            ALTER TABLE ""PurchaseDetails"" DROP COLUMN ""IMEI1"";
                        END IF;
                        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PurchaseDetails' AND column_name='IMEI2') THEN
                            ALTER TABLE ""PurchaseDetails"" DROP COLUMN ""IMEI2"";
                        END IF;
                        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='PurchaseDetails' AND column_name='SerialNumber') THEN
                            ALTER TABLE ""PurchaseDetails"" DROP COLUMN ""SerialNumber"";
                        END IF;
                    END $$;
                ");
                Console.WriteLine("Schema drift fixed successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Failed to fix schema drift: {ex.Message}");
            }
        }

        public async Task CleanupDatabaseAsync()
        {
            try 
            {
                // Hard delete all users except 'admin' and all companies except ComId 1
                // and all data related to other companies.
                // We use raw SQL to bypass the soft-delete logic in SaveChangesAsync.
                
                await _context.Database.ExecuteSqlRawAsync(@"
                    DELETE FROM ""Users"" WHERE ""Username"" != 'admin';
                    DELETE FROM ""Companies"" WHERE ""Id"" != 1;
                    
                    -- Clean up all tenant-specific data for ComId > 1 or NULL (except global data)
                ");

                var entityTypes = _context.Model.GetEntityTypes();
                foreach (var entityType in entityTypes)
                {
                    var comIdProperty = entityType.FindProperty("ComId");
                    if (comIdProperty != null)
                    {
                        var tableName = entityType.GetTableName();
                        if (!string.IsNullOrEmpty(tableName) && tableName != "Companies" && tableName != "Users")
                        {
                            await _context.Database.ExecuteSqlRawAsync($@"DELETE FROM ""{tableName}"" WHERE ""ComId"" > 1 OR ""ComId"" IS NULL");
                        }
                    }

                    if (entityType.ClrType == typeof(StolenDeviceReport))
                    {
                         await _context.Database.ExecuteSqlRawAsync(@"DELETE FROM ""StolenDeviceReports"" WHERE ""ReportedByComId"" > 1");
                    }
                }

                Console.WriteLine("Database hard cleanup completed successfully. Kept only admin and ComId 1.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Database cleanup failed: {ex.Message}");
            }
        }

        public async Task SeedMobileDevicesAsync(string csvFilePath)
        {
            if (await _context.MobileDevices.IgnoreQueryFilters().AnyAsync()) return;

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
            if (await _context.AccountCategories.IgnoreQueryFilters().AnyAsync()) return;

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
            var admin = await _context.Users.IgnoreQueryFilters().FirstOrDefaultAsync(u => u.Username == "admin");
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
            if (await _context.Companies.IgnoreQueryFilters().AnyAsync()) return;

            var company = new Company 
            { 
                Name = "Dominate Software Solution", 
                Address = "Dhaka, Bangladesh", 
                Phone = "+8801700000000", 
                Email = "info@dominate.com", 
                IsActive = true,
                IsVerified = true,
                SubscriptionExpiryDate = DateTime.UtcNow.AddYears(10),
                PlanType = "Yearly"
            };
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            var branch = new Branch { Name = "Main Branch", Address = "Head Office, Dhaka", Phone = "+8801700000000", IsMainBranch = true, ComId = company.Id };
            _context.Branches.Add(branch);
            await _context.SaveChangesAsync();
        }

        public async Task SeedMasterDataAsync()
        {
            if (!await _context.WarrantyTypes.IgnoreQueryFilters().AnyAsync())
            {
                var items = new[] { "No Warranty", "Official Warranty", "Unofficial Warranty", "Seller Warranty", "Shop Warranty", "Distributor Warranty", "International Warranty", "Replacement Warranty", "Service Warranty", "Check Warranty" };
                await _context.WarrantyTypes.AddRangeAsync(items.Select(i => new WarrantyType { Name = i, ComId = null }));
            }

            if (!await _context.WarrantyDurations.IgnoreQueryFilters().AnyAsync())
            {
                var items = new (string Name, int Days)[] { 
                    ("No Warranty", 0), ("7 Days", 7), ("15 Days", 15), ("30 Days", 30), 
                    ("2 Months", 60), ("3 Months", 90), ("6 Months", 180), 
                    ("1 Year", 365), ("2 Years", 730), ("Custom", 0) 
                };
                await _context.WarrantyDurations.AddRangeAsync(items.Select(i => new WarrantyDuration { Name = i.Name, Days = i.Days, ComId = null }));
            }

            if (!await _context.WarrantyCoverages.IgnoreQueryFilters().AnyAsync())
            {
                var items = new[] { "Service Only", "Parts & Service", "Display Warranty", "Battery Warranty", "Software Warranty", "Motherboard Warranty", "Replacement Guarantee", "Full Warranty", "IMEI Guarantee", "Charging Warranty" };
                await _context.WarrantyCoverages.AddRangeAsync(items.Select(i => new WarrantyCoverage { Name = i, ComId = null }));
            }

            if (!await _context.ProductConditions.IgnoreQueryFilters().AnyAsync())
            {
                var items = new[] { "Brand New", "Intact", "Open Box", "With Box", "Without Box", "Used", "Refurbished", "Demo", "Display Unit", "Scratchless", "Minor Scratch", "Heavy Used", "Broken", "Water Damage" };
                await _context.ProductConditions.AddRangeAsync(items.Select(i => new ProductCondition { Name = i, ComId = null }));
            }

            if (!await _context.MarketTypes.IgnoreQueryFilters().AnyAsync())
            {
                var items = new[] { "Official", "Unofficial", "Global Version", "International Version", "Carrier Locked", "Factory Unlocked", "Tax Paid", "Non Tax Paid" };
                await _context.MarketTypes.AddRangeAsync(items.Select(i => new MarketType { Name = i, ComId = null }));
            }

            await _context.SaveChangesAsync();
        }

        public async Task SeedContactsAsync()
        {
            if (await _context.Contacts.IgnoreQueryFilters().AnyAsync()) return;

            var contacts = new List<Contact>
            {
                new Contact { Name = "Walk-in Customer", Phone = "0000", Email = "walkin@example.com", Address = "N/A", IsCustomer = true, IsSupplier = false, ComId = 1 },
                new Contact { Name = "John Doe", Phone = "01711223344", Email = "john@example.com", Address = "Dhaka, Bangladesh", IsCustomer = true, IsSupplier = false, ComId = 1 },
                new Contact { Name = "Global Supplier Ltd", Phone = "01888776655", Email = "sales@globalsupplier.com", Address = "Singapore", IsCustomer = false, IsSupplier = true, ComId = 1 },
                new Contact { Name = "Jane Smith", Phone = "01999887766", Email = "jane@example.com", Address = "Chittagong", IsCustomer = true, IsSupplier = true, ComId = 1 },
                new Contact { Name = "Local Mobile Wholesaler", Phone = "01555443322", Email = "info@localmobile.com", Address = "Dhaka", IsCustomer = false, IsSupplier = true, ComId = 1 }
            };

            await _context.Contacts.AddRangeAsync(contacts);
            await _context.SaveChangesAsync();
            Console.WriteLine($"Successfully seeded {contacts.Count} sample contacts.");
        }

        public async Task SeedCustomAsync(string businessType, List<string> tables, int comId)
        {
            if (tables.Contains("Categories"))
            {
                var categories = new List<ProductCategory>();
                switch (businessType)
                {
                    case "Mobile":
                        categories.Add(new ProductCategory { Name = "Smartphones", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Feature Phones", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Accessories", ComId = comId });
                        break;
                    case "Computer":
                        categories.Add(new ProductCategory { Name = "Laptops", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Desktops", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Components", ComId = comId });
                        break;
                    case "Grocery":
                        categories.Add(new ProductCategory { Name = "Beverages", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Snacks", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Dairy", ComId = comId });
                        break;
                    case "MotorParts":
                        categories.Add(new ProductCategory { Name = "Engine Parts", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Tyres", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Oils", ComId = comId });
                        break;
                    case "Clothing":
                        categories.Add(new ProductCategory { Name = "Men's Wear", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Women's Wear", ComId = comId });
                        categories.Add(new ProductCategory { Name = "Kids", ComId = comId });
                        break;
                }
                if (categories.Any())
                {
                    await _context.ProductCategories.AddRangeAsync(categories);
                    await _context.SaveChangesAsync();
                }
            }

            if (tables.Contains("Brands"))
            {
                var brands = new List<Brand>();
                switch (businessType)
                {
                    case "Mobile":
                        brands.Add(new Brand { Name = "Apple", ComId = comId });
                        brands.Add(new Brand { Name = "Samsung", ComId = comId });
                        brands.Add(new Brand { Name = "Xiaomi", ComId = comId });
                        break;
                    case "Computer":
                        brands.Add(new Brand { Name = "Dell", ComId = comId });
                        brands.Add(new Brand { Name = "HP", ComId = comId });
                        brands.Add(new Brand { Name = "Asus", ComId = comId });
                        break;
                    case "Grocery":
                        brands.Add(new Brand { Name = "Coca Cola", ComId = comId });
                        brands.Add(new Brand { Name = "Lays", ComId = comId });
                        brands.Add(new Brand { Name = "Nestle", ComId = comId });
                        break;
                    case "MotorParts":
                        brands.Add(new Brand { Name = "MRF", ComId = comId });
                        brands.Add(new Brand { Name = "Castrol", ComId = comId });
                        brands.Add(new Brand { Name = "Bosch", ComId = comId });
                        break;
                    case "Clothing":
                        brands.Add(new Brand { Name = "Zara", ComId = comId });
                        brands.Add(new Brand { Name = "H&M", ComId = comId });
                        brands.Add(new Brand { Name = "Levis", ComId = comId });
                        break;
                }
                if (brands.Any())
                {
                    await _context.Brands.AddRangeAsync(brands);
                    await _context.SaveChangesAsync();
                }
            }

            if (tables.Contains("MobileDevices") && businessType == "Mobile")
            {
                var devices = new List<MobileDevice>
                {
                    new MobileDevice { Brand = "Apple", ModelName = "iPhone 15 Pro", Color = "Natural Titanium", RAM = "8GB", Storage = "256GB", IsOfficial = true, DefaultCostPrice = 145000, DefaultSalesPrice = 155000, ComId = comId },
                    new MobileDevice { Brand = "Samsung", ModelName = "Galaxy S24 Ultra", Color = "Titanium Black", RAM = "12GB", Storage = "512GB", IsOfficial = true, DefaultCostPrice = 135000, DefaultSalesPrice = 149999, ComId = comId }
                };
                await _context.MobileDevices.AddRangeAsync(devices);
                await _context.SaveChangesAsync();
            }

            if (tables.Contains("Products"))
            {
                var cat = await _context.ProductCategories.FirstOrDefaultAsync(c => c.ComId == comId);
                var products = new List<Product>();
                switch (businessType)
                {
                    case "Computer":
                        products.Add(new Product { Name = "MacBook Pro M3", ProductCategoryId = cat?.Id ?? 0, SKU = "MBP-M3", ComId = comId });
                        products.Add(new Product { Name = "Dell XPS 15", ProductCategoryId = cat?.Id ?? 0, SKU = "XPS-15", ComId = comId });
                        break;
                    case "Grocery":
                        products.Add(new Product { Name = "Fresh Milk 1L", ProductCategoryId = cat?.Id ?? 0, SKU = "MILK-1L", ComId = comId });
                        products.Add(new Product { Name = "Basmati Rice 5KG", ProductCategoryId = cat?.Id ?? 0, SKU = "RICE-5K", ComId = comId });
                        break;
                    case "MotorParts":
                        products.Add(new Product { Name = "Brake Pad Set", ProductCategoryId = cat?.Id ?? 0, SKU = "BRK-PD", ComId = comId });
                        products.Add(new Product { Name = "Headlight Bulb", ProductCategoryId = cat?.Id ?? 0, SKU = "BULB-H", ComId = comId });
                        break;
                    case "Clothing":
                        products.Add(new Product { Name = "Formal Cotton Shirt", ProductCategoryId = cat?.Id ?? 0, SKU = "SHIRT-F", ComId = comId });
                        products.Add(new Product { Name = "Blue Denim Jeans", ProductCategoryId = cat?.Id ?? 0, SKU = "JEAN-B", ComId = comId });
                        break;
                }
                if (products.Any())
                {
                    await _context.Products.AddRangeAsync(products);
                    await _context.SaveChangesAsync();
                }
            }

            if (tables.Contains("Contacts"))
            {
                var contacts = new List<Contact>
                {
                    new Contact { Name = "Regular Customer", Phone = "01700112233", Address = "Local City", IsCustomer = true, IsSupplier = false, ComId = comId },
                    new Contact { Name = "Main Wholesaler", Phone = "01800112233", Address = "Industrial Area", IsCustomer = false, IsSupplier = true, ComId = comId }
                };
                await _context.Contacts.AddRangeAsync(contacts);
                await _context.SaveChangesAsync();
            }

            if (tables.Contains("Accounts"))
            {
                var categories = await _context.AccountCategories.ToListAsync();
                if (!categories.Any())
                {
                    categories = new List<AccountCategory>
                    {
                        new AccountCategory { Name = "Assets", Code = "100" },
                        new AccountCategory { Name = "Liabilities", Code = "200" },
                        new AccountCategory { Name = "Equity", Code = "300" },
                        new AccountCategory { Name = "Income", Code = "400" },
                        new AccountCategory { Name = "Expense", Code = "500" }
                    };
                    await _context.AccountCategories.AddRangeAsync(categories);
                    await _context.SaveChangesAsync();
                }

                var heads = new List<AccountHead>();
                var assetId = categories.FirstOrDefault(c => c.Name == "Assets")?.Id ?? 0;
                heads.Add(new AccountHead { Name = "Main Cash", AccountCategoryId = assetId, AccountType = "Cash", ComId = comId });
                heads.Add(new AccountHead { Name = "Corporate Bank Acc", AccountCategoryId = assetId, AccountType = "Bank", ComId = comId });

                var incomeId = categories.FirstOrDefault(c => c.Name == "Income")?.Id ?? 0;
                heads.Add(new AccountHead { Name = "Sales Revenue", AccountCategoryId = incomeId, AccountType = "General", ComId = comId });

                await _context.AccountHeads.AddRangeAsync(heads);
                await _context.SaveChangesAsync();
            }
        }
    }
}
