using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    public class MobileDevice : TenantBaseEntity
    {
        public string Brand { get; set; } = string.Empty;
        public string ModelName { get; set; } = string.Empty;
        public string? ModelNumber { get; set; }
        public string? VariantName { get; set; }
        public string? Color { get; set; }
        public string? RAM { get; set; }
        public string? Storage { get; set; }
        public string? Chipset { get; set; }
        public string? BatteryCapacity { get; set; }
        public string? Barcode { get; set; }
        public string? EAN { get; set; }
        public string? CountryOfOrigin { get; set; }
        public string? ImageLink { get; set; }
        public bool IsOfficial { get; set; }
        public bool IsBTRCApproved { get; set; }
    }
}
