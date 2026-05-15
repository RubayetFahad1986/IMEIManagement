using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MobileERP.API.Controllers;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Application.Services;
using Moq;
using System.Linq;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace MobileERP.Tests
{
    public class ResellerTests
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
        public async Task Reseller_Stats_AreCorrectlyCalculated()
        {
            // Arrange
            using var context = GetInMemoryContext("ResellerStatsDb");
            
            var reseller = new User { Id = 1, FullName = "Partner 1", Role = "Reseller" };
            context.Users.Add(reseller);
            
            context.Companies.Add(new Company { Name = "Client 1", ResellerId = 1, IsActive = true });
            context.Companies.Add(new Company { Name = "Client 2", ResellerId = 1, IsActive = false });
            
            context.ResellerTransactions.Add(new ResellerTransaction { ResellerId = 1, Quantity = 50 });
            
            await context.SaveChangesAsync();

            // Act
            var activatedCount = await context.Companies.CountAsync(c => c.ResellerId == 1 && c.IsActive);
            var totalAllocated = await context.ResellerTransactions.Where(t => t.ResellerId == 1).SumAsync(t => t.Quantity);

            // Assert
            Assert.Equal(1, activatedCount);
            Assert.Equal(50, totalAllocated);
        }
    }
}
