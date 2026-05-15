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
    public class SalesReportTests
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
        public async Task Sales_In_Different_Months_Are_Grouped_Correctly()
        {
            // Arrange
            using var context = GetInMemoryContext("SalesGroupingDb");
            
            // Sale in May
            context.SalesInvoices.Add(new SalesInvoice 
            { 
                InvoiceNo = "SAL-MAY", 
                SalesDate = new DateTime(2026, 5, 15, 10, 0, 0, DateTimeKind.Utc), 
                NetTotal = 1000 
            });

            // Sale in June
            context.SalesInvoices.Add(new SalesInvoice 
            { 
                InvoiceNo = "SAL-JUN", 
                SalesDate = new DateTime(2026, 6, 01, 10, 0, 0, DateTimeKind.Utc), 
                NetTotal = 2000 
            });

            await context.SaveChangesAsync();

            // Act - simulate monthly report query
            var mayStart = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc);
            var mayEnd = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);

            var maySales = await context.SalesInvoices
                .Where(s => s.SalesDate >= mayStart && s.SalesDate < mayEnd)
                .SumAsync(s => s.NetTotal);

            var juneSales = await context.SalesInvoices
                .Where(s => s.SalesDate >= mayEnd)
                .SumAsync(s => s.NetTotal);

            // Assert
            Assert.Equal(1000, maySales);
            Assert.Equal(2000, juneSales);
        }
    }
}
