using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Domain.Common;
using System.Linq.Expressions;

namespace MobileERP.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<MobileDevice> MobileDevices { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseDetail> PurchaseDetails { get; set; }
        public DbSet<InventoryItem> Inventory { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesDetail> SalesDetails { get; set; }
        public DbSet<SalesPayment> SalesPayments { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<GlobalMobileMaster> GlobalMobileMasters { get; set; }

        // Accounting
        public DbSet<AccountCategory> AccountCategories { get; set; }
        public DbSet<AccountHead> AccountHeads { get; set; }
        public DbSet<JournalVoucher> JournalVouchers { get; set; }
        public DbSet<JournalEntry> JournalEntries { get; set; }
        public DbSet<ExpenseVoucher> ExpenseVouchers { get; set; }
        public DbSet<ExpenseDetail> ExpenseDetails { get; set; }
        public DbSet<ContactLedger> ContactLedgers { get; set; }

        // Advanced Modules
        public DbSet<SalesReturn> SalesReturns { get; set; }
        public DbSet<SalesReturnDetail> SalesReturnDetails { get; set; }
        public DbSet<PurchaseReturn> PurchaseReturns { get; set; }
        public DbSet<PurchaseReturnDetail> PurchaseReturnDetails { get; set; }
        public DbSet<WarrantyClaim> WarrantyClaims { get; set; }
        public DbSet<StolenDeviceReport> StolenDeviceReports { get; set; }
        public DbSet<Branch> Branches { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<EmployeeCommission> EmployeeCommissions { get; set; }
        public DbSet<BranchTransfer> BranchTransfers { get; set; }
        public DbSet<BranchTransferDetail> BranchTransferDetails { get; set; }
        public DbSet<ProductHistory> ProductHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and indexes
            modelBuilder.Entity<InventoryItem>()
                .HasIndex(i => i.IMEI1)
                .IsUnique();

            modelBuilder.Entity<PurchaseInvoice>()
                .HasMany(p => p.Details)
                .WithOne()
                .HasForeignKey(d => d.PurchaseInvoiceId);

            modelBuilder.Entity<SalesInvoice>()
                .HasMany(s => s.Details)
                .WithOne()
                .HasForeignKey(d => d.SalesInvoiceId);

            // Global Soft Delete Filter
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(ConvertFilterExpression(entityType.ClrType));
                }
            }
        }

        private static LambdaExpression ConvertFilterExpression(Type type)
        {
            var parameter = Expression.Parameter(type, "e");
            var property = Expression.Property(parameter, nameof(BaseEntity.IsDelete));
            var notExpression = Expression.Not(property);
            return Expression.Lambda(notExpression, parameter);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreateDate = DateTime.UtcNow;
                        // entry.Entity.LuserId = _currentUserService.UserId; // To be implemented with Auth
                        entry.Entity.IsDelete = false;
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdateDate = DateTime.UtcNow;
                        // entry.Entity.LuserIdUpdate = _currentUserService.UserId;
                        break;
                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDelete = true;
                        entry.Entity.UpdateDate = DateTime.UtcNow;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
