using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Domain.Common;
using System.Linq.Expressions;
using MobileERP.Application.Services;

namespace MobileERP.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        private readonly ICurrentUserService _currentUserService;

        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ICurrentUserService currentUserService) : base(options)
        {
            _currentUserService = currentUserService;
        }

        public DbSet<Company> Companies { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Brand> Brands { get; set; }
        public DbSet<MobileDevice> MobileDevices { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<PurchaseInvoice> PurchaseInvoices { get; set; }
        public DbSet<PurchaseDetail> PurchaseDetails { get; set; }
        public DbSet<InventoryItem> Inventory { get; set; }
        public DbSet<ImeiItem> ImeiItems { get; set; }
        public DbSet<SalesInvoice> SalesInvoices { get; set; }
        public DbSet<SalesDetail> SalesDetails { get; set; }
        public DbSet<SalesPayment> SalesPayments { get; set; }
        public DbSet<ProductCategory> ProductCategories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<GlobalMobileMaster> GlobalMobileMasters { get; set; }

        // Master Data
        public DbSet<WarrantyType> WarrantyTypes { get; set; }
        public DbSet<WarrantyDuration> WarrantyDurations { get; set; }
        public DbSet<WarrantyCoverage> WarrantyCoverages { get; set; }
        public DbSet<ProductCondition> ProductConditions { get; set; }
        public DbSet<MarketType> MarketTypes { get; set; }

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
        public DbSet<ResellerTransaction> ResellerTransactions { get; set; }
        public DbSet<Warehouse> Warehouses { get; set; }
        public DbSet<DocumentSequence> DocumentSequences { get; set; }

        public int? CurrentComId => _currentUserService.ComId;
        public string? CurrentRole => _currentUserService.Role;
        public string? CurrentUserId => _currentUserService.UserId;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and indexes
            modelBuilder.Entity<InventoryItem>()
                .HasIndex(i => i.IMEI1)
                .HasFilter("\"IsDelete\" = false")
                .IsUnique();

            modelBuilder.Entity<PurchaseInvoice>()
                .HasMany(p => p.Details)
                .WithOne()
                .HasForeignKey(d => d.PurchaseInvoiceId);

            modelBuilder.Entity<SalesInvoice>()
                .HasMany(s => s.Details)
                .WithOne()
                .HasForeignKey(d => d.SalesInvoiceId);

            // Global Soft Delete and Tenant Filter
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    var isDeleteProperty = entityType.ClrType.GetProperty(nameof(BaseEntity.IsDelete));
                    var comIdProperty = entityType.ClrType.GetProperty("ComId");

                    var parameter = Expression.Parameter(entityType.ClrType, "e");
                    Expression? filter = null;

                    if (isDeleteProperty != null)
                    {
                        var isDeleteExpression = Expression.Not(Expression.Property(parameter, isDeleteProperty));
                        filter = isDeleteExpression;
                    }

                    if (comIdProperty != null && typeof(TenantBaseEntity).IsAssignableFrom(entityType.ClrType))
                    {
                        var currentComIdProp = typeof(ApplicationDbContext).GetProperty(nameof(CurrentComId));
                        var currentRoleProp = typeof(ApplicationDbContext).GetProperty(nameof(CurrentRole));

                        // (Role == "SuperAdmin")
                        var isSuperAdminExpression = Expression.Equal(
                            Expression.Property(Expression.Constant(this), currentRoleProp!),
                            Expression.Constant("SuperAdmin")
                        );

                        // (e.ComId == this.CurrentComId)
                        var comIdExpression = Expression.Equal(
                            Expression.Property(parameter, comIdProperty),
                            Expression.Property(Expression.Constant(this), currentComIdProp!)
                        );

                        // (e.ComId == null)
                        var globalExpression = Expression.Equal(
                            Expression.Property(parameter, comIdProperty), 
                            Expression.Constant(null, typeof(int?))
                        );

                        // Final Tenant Filter: Role == "SuperAdmin" || ComId == CurrentComId || ComId == null
                        var tenantFilter = Expression.OrElse(isSuperAdminExpression, 
                            Expression.OrElse(comIdExpression, globalExpression));

                        if (filter == null)
                        {
                            filter = tenantFilter;
                        }
                        else
                        {
                            filter = Expression.AndAlso(filter, tenantFilter);
                        }
                    }

                    if (filter != null)
                    {
                        modelBuilder.Entity(entityType.ClrType).HasQueryFilter(Expression.Lambda(filter, parameter));
                    }
                }
            }
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreateDate = DateTime.UtcNow;
                        entry.Entity.LuserId = _currentUserService?.UserId;
                        entry.Entity.IsDelete = false;
                        
                        if (entry.Entity is TenantBaseEntity tenantEntity && !tenantEntity.ComId.HasValue)
                        {
                            tenantEntity.ComId = _currentUserService?.ComId;
                        }
                        break;
                    case EntityState.Modified:
                        entry.Entity.UpdateDate = DateTime.UtcNow;
                        entry.Entity.LuserIdUpdate = _currentUserService?.UserId;
                        break;
                    case EntityState.Deleted:
                        entry.State = EntityState.Modified;
                        entry.Entity.IsDelete = true;
                        entry.Entity.UpdateDate = DateTime.UtcNow;
                        entry.Entity.LuserIdUpdate = _currentUserService?.UserId;
                        break;
                }
            }
            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
