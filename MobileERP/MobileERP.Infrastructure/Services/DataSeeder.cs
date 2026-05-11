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
            if (await _context.MobileDevices.AnyAsync())
            {
                return; // Already seeded
            }

            if (!File.Exists(csvFilePath))
            {
                Console.WriteLine($"Seed file not found: {csvFilePath}");
                return;
            }

            var devices = new List<MobileDevice>();
            var lines = await File.ReadAllLinesAsync(csvFilePath);

            // Skip header
            for (int i = 1; i < lines.Length; i++)
            {
                var line = lines[i];
                if (string.IsNullOrWhiteSpace(line)) continue;

                var parts = ParseCsvLine(line);
                if (parts.Length < 8) continue;

                devices.Add(new MobileDevice
                {
                    Brand = parts[0],
                    ModelName = parts[1],
                    ModelNumber = parts[2],
                    VariantName = parts[3],
                    Color = parts[4],
                    RAM = parts[5],
                    Storage = parts[6],
                    Chipset = parts[7],
                    BatteryCapacity = parts[8],
                    ImageLink = parts.Length > 9 ? parts[9] : null,
                    IsOfficial = true,
                    IsBTRCApproved = true
                });
            }

            if (devices.Any())
            {
                await _context.MobileDevices.AddRangeAsync(devices);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Successfully seeded {devices.Count} mobile devices.");
            }
        }

        private string[] ParseCsvLine(string line)
        {
            // Simple CSV parser that handles quotes if necessary, 
            // but for our simple generated file, Split(',') is mostly fine.
            // Using a basic state machine for robustness.
            var result = new List<string>();
            var currentField = "";
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                if (c == '\"')
                {
                    inQuotes = !inQuotes;
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(currentField.Trim('\"'));
                    currentField = "";
                }
                else
                {
                    currentField += c;
                }
            }
            result.Add(currentField.Trim('\"'));
            return result.ToArray();
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
            
            // Assets (Cash/Bank/Stock)
            var assetId = categories.First(c => c.Name == "Assets").Id;
            heads.Add(new AccountHead { Name = "Cash In Hand", AccountCategoryId = assetId, AccountType = "Cash", IsDefault = true });
            heads.Add(new AccountHead { Name = "Dutch Bangla Bank", AccountCategoryId = assetId, AccountType = "Bank", IsDefault = true });
            heads.Add(new AccountHead { Name = "Bkash Merchant", AccountCategoryId = assetId, AccountType = "Bank", IsDefault = true });
            heads.Add(new AccountHead { Name = "Inventory", AccountCategoryId = assetId, AccountType = "General", IsDefault = true });

            // Expenses
            var expenseId = categories.First(c => c.Name == "Expense").Id;
            heads.Add(new AccountHead { Name = "Shop Rent", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true });
            heads.Add(new AccountHead { Name = "Electricity Bill", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true });
            heads.Add(new AccountHead { Name = "Staff Salary", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true });
            heads.Add(new AccountHead { Name = "Cost of Goods Sold", AccountCategoryId = expenseId, AccountType = "General", IsDefault = true });

            // Income
            var incomeId = categories.First(c => c.Name == "Income").Id;
            heads.Add(new AccountHead { Name = "Sales Revenue", AccountCategoryId = incomeId, AccountType = "General", IsDefault = true });
            heads.Add(new AccountHead { Name = "Service Charge", AccountCategoryId = incomeId, AccountType = "General", IsDefault = true });

            await _context.AccountHeads.AddRangeAsync(heads);
            await _context.SaveChangesAsync();
        }

        public async Task SeedAdminUserAsync()
        {
            if (await _context.Users.AnyAsync(u => u.Role == "SuperAdmin")) return;

            var admin = new User
            {
                Username = "admin",
                Email = "Admin@gmail.com",
                PasswordHash = "Admin123", // In real app, hash this
                FullName = "Super Administrator",
                Role = "SuperAdmin",
                IsActive = true
            };

            _context.Users.Add(admin);
            await _context.SaveChangesAsync();
            Console.WriteLine("Successfully seeded admin user.");
        }
    }
}
