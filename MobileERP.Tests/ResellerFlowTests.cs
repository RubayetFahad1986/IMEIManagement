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
    public class ResellerFlowTests
    {
        private ApplicationDbContext GetInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            
            var mockUser = new Mock<ICurrentUserService>();
            mockUser.Setup(u => u.ComId).Returns(1);
            mockUser.Setup(u => u.UserId).Returns("admin-id");

            return new ApplicationDbContext(options, mockUser.Object);
        }

        [Fact]
        public async Task Signup_With_Reseller_PromoCode_Links_Company_To_Reseller()
        {
            // Arrange
            using var context = GetInMemoryContext("SignupFlowDb");
            
            // 1. Create a Reseller
            var reseller = new User 
            { 
                Id = 100, 
                FullName = "Mega Reseller", 
                Role = "Reseller", 
                PromoCode = "MEGA2026", 
                AvailableCopies = 10 
            };
            context.Users.Add(reseller);
            await context.SaveChangesAsync();

            // 2. Simulate Signup logic (from AuthController)
            var promoCode = "MEGA2026";
            var linkedReseller = await context.Users
                .FirstOrDefaultAsync(u => u.PromoCode == promoCode && u.Role == "Reseller");

            var newCompany = new Company 
            { 
                Name = "New Client Ltd", 
                ResellerId = linkedReseller?.Id,
                IsActive = false // Pending reseller activation
            };
            context.Companies.Add(newCompany);
            await context.SaveChangesAsync();

            // Assert
            Assert.NotNull(linkedReseller);
            Assert.Equal(reseller.Id, newCompany.ResellerId);
            
            // 3. Reseller activates company
            if (linkedReseller != null && linkedReseller.AvailableCopies > 0)
            {
                newCompany.IsActive = true;
                newCompany.SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1);
                linkedReseller.AvailableCopies--;
                
                context.ResellerTransactions.Add(new ResellerTransaction 
                { 
                    ResellerId = linkedReseller.Id, 
                    Quantity = -1, 
                    Remarks = $"Activated {newCompany.Name}" 
                });
            }
            await context.SaveChangesAsync();

            // Final Assert
            Assert.True(newCompany.IsActive);
            Assert.Equal(9, reseller.AvailableCopies);
            Assert.Equal(1, context.ResellerTransactions.Count());
        }
    }
}
