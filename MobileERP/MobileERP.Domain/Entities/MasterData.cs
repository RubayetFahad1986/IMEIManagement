using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    // --- Warranty & Product Master Tables ---

    public class WarrantyType : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
    }

    public class WarrantyDuration : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int Days { get; set; } // Actual days for calculation
    }

    public class WarrantyCoverage : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
    }

    public class ProductCondition : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
    }

    public class MarketType : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
    }

    public class DocumentSequence : TenantBaseEntity
    {
        public string DocumentType { get; set; } = string.Empty; // e.g. "Sale", "Purchase"
        public string Prefix { get; set; } = string.Empty; // e.g. "SAL-", "PRD-"
        public long NextNumber { get; set; } = 10000;
    }

    public class Warehouse : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public bool IsDefault { get; set; }
    }
}
