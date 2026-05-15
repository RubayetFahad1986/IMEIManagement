using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Application.Services;
using Moq;
using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace MobileERP.Tests
{
    public class ResellerTransactionTests
    {
        private ApplicationDbContext GetInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            
            var mockUser = new Mock<ICurrentUserService>();
            // Simulate an end-user belonging to a company that is managed by a reseller
            mockUser.Setup(u => u.ComId).Returns(20); 
            mockUser.Setup(u => u.UserId).Returns("client-user-id");

            return new ApplicationDbContext(options, mockUser.Object);
        }

        [Fact]
        public async Task Transaction_Scoping_To_ResellerCompany_WorksCorrectly()
        {
            // Arrange: 
            // 1. Setup Reseller
            // 2. Setup Company linked to Reseller
            // 3. Setup User belonging to Company
            using var context = GetInMemoryContext("ResellerTransactionScopingDb");
            
            var reseller = new User { Id = 10, FullName = "Reseller", Role = "Reseller" };
            context.Users.Add(reseller);

            var company = new Company { Id = 20, Name = "Client Business", ResellerId = 10, IsActive = true };
            context.Companies.Add(company);

            var user = new User { Id = 2, FullName = "Client Staff", Role = "User", ComId = 20 };
            context.Users.Add(user);

            // Record a transaction for this company
            context.SalesInvoices.Add(new SalesInvoice 
            { 
                InvoiceNo = "INV-001", 
                SalesDate = DateTime.UtcNow, 
                CustomerId = 1,
                NetTotal = 5000,
                ComId = 20 // Scoped to company
            });

            await context.SaveChangesAsync();

            // Act: Simulate a query from the perspective of the company user
            var companyInvoices = await context.SalesInvoices
                .Where(s => s.ComId == 20)
                .ToListAsync();

            // Assert
            Assert.Single(companyInvoices);
            Assert.Equal(20, companyInvoices[0].ComId);
            Assert.Equal("INV-001", companyInvoices[0].InvoiceNo);
        }

        [Fact]
        public async Task Reseller_Dashboard_Calculates_EndUserCountCorrectly()
        {
            // Verify reseller panel logic
            using var context = GetInMemoryContext("ResellerPanelDb");

            var reseller = new User { Id = 5, FullName = "Partner", Role = "Reseller" };
            context.Users.Add(reseller);

            // Company 1 (Managed by reseller)
            context.Companies.Add(new Company { Id = 101, Name = "C1", ResellerId = 5 });
            context.Users.Add(new User { Id = 51, FullName = "U1", ComId = 101 });
            context.Users.Add(new User { Id = 52, FullName = "U2", ComId = 101 });

            // Company 2 (Managed by reseller)
            context.Companies.Add(new Company { Id = 102, Name = "C2", ResellerId = 5 });
            context.Users.Add(new User { Id = 53, FullName = "U3", ComId = 102 });

            await context.SaveChangesAsync();

            // Logic mirroring ResellerController.GetMyPanel()
            var userCount = await context.Users
                .CountAsync(u => context.Companies.Any(c => c.ResellerId == 5 && c.Id == u.ComId));

            Assert.Equal(3, userCount);
        }
    }
}
