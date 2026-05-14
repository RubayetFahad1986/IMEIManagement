using System;
using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    public class ResellerTransaction : BaseEntity
    {
        public int ResellerId { get; set; }
        public User? Reseller { get; set; }
        public int Quantity { get; set; }
        public decimal PricePerCopy { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Remarks { get; set; }
    }
}
