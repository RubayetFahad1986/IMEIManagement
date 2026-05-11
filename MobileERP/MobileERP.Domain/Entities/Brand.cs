using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    public class Brand : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}
