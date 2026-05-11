using System;

namespace MobileERP.Domain.Common
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreateDate { get; set; } = DateTime.UtcNow;
        public string? LuserId { get; set; } // ID of the user who created
        public DateTime? UpdateDate { get; set; }
        public string? LuserIdUpdate { get; set; } // ID of the user who last updated
        public bool IsDelete { get; set; }
    }

    public abstract class TenantBaseEntity : BaseEntity
    {
        public int? ComId { get; set; } // Nullable: Null means global reference data
    }
}
