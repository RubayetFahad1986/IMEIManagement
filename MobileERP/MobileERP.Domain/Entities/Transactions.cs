using MobileERP.Domain.Common;
using System;
using System.Collections.Generic;

namespace MobileERP.Domain.Entities
{
    public class Supplier : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal CurrentBalance { get; set; }
    }

    public class Customer : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? NID { get; set; }
        public string? Passport { get; set; }
        public string? DrivingLicense { get; set; }
        public decimal CurrentBalance { get; set; }
    }

    public class ProductCategory : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty; // Mobile, Charger, Headphone
    }

    public class Product : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int ProductCategoryId { get; set; }
        public bool HasIMEI { get; set; } // True for Mobile, False for Accessories
        public string? SKU { get; set; }
        public string? ImageLink { get; set; }
    }

    public class PurchaseInvoice : TenantBaseEntity
    {
        public string InvoiceNo { get; set; } = string.Empty;
        public DateTime PurchaseDate { get; set; }
        public int SupplierId { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal DueAmount { get; set; }
        public string? Remarks { get; set; }
        public ICollection<PurchaseDetail> Details { get; set; } = new List<PurchaseDetail>();
    }

    public class PurchaseDetail : TenantBaseEntity
    {
        public int PurchaseInvoiceId { get; set; }
        public int MobileDeviceId { get; set; }
        public string IMEI1 { get; set; } = string.Empty;
        public string? IMEI2 { get; set; }
        public string? SerialNumber { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public string? BatteryHealth { get; set; }
        public string? Condition { get; set; }
    }

    public class InventoryItem : TenantBaseEntity
    {
        public int? MobileDeviceId { get; set; }
        public MobileDevice? MobileDevice { get; set; }
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
        public string? IMEI1 { get; set; }
        public string? IMEI2 { get; set; }
        public string? SerialNumber { get; set; }
        public decimal CostPrice { get; set; }
        public decimal CurrentSalePrice { get; set; }
        public decimal CommissionAmount { get; set; } // Default commission for selling this unit
        public decimal Quantity { get; set; } = 1;
        public bool IsSold { get; set; }
        public int? PurchaseInvoiceId { get; set; }
        public int? SalesInvoiceId { get; set; }
        public int? BranchId { get; set; }
        public string Condition { get; set; } = "New"; // New, Used
        public string BoxStatus { get; set; } = "Intact"; // Intact, WithBox, NoBox
        public DateTime? WarrantyExpiryDate { get; set; }
    }

    public class BranchTransfer : TenantBaseEntity
    {
        public int FromBranchId { get; set; }
        public int ToBranchId { get; set; }
        public DateTime TransferDate { get; set; }
        public string? Remarks { get; set; }
        public string Status { get; set; } = "Sent";
        public ICollection<BranchTransferDetail> Details { get; set; } = new List<BranchTransferDetail>();
    }

    public class BranchTransferDetail : TenantBaseEntity
    {
        public int BranchTransferId { get; set; }
        public int InventoryItemId { get; set; }
    }

    public class SalesInvoice : TenantBaseEntity
    {
        public string InvoiceNo { get; set; } = string.Empty;
        public DateTime SalesDate { get; set; }
        public int? CustomerId { get; set; }
        public int? SalesPersonId { get; set; } // Linked to Employee
        public decimal SubTotal { get; set; }
        public decimal Discount { get; set; }
        public decimal NetTotal { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal ChangeAmount { get; set; }
        public ICollection<SalesDetail> Details { get; set; } = new List<SalesDetail>();
        public ICollection<SalesPayment> Payments { get; set; } = new List<SalesPayment>();
    }

    public class SalesPayment : TenantBaseEntity
    {
        public int SalesInvoiceId { get; set; }
        public string Method { get; set; } = "Cash"; // Cash, Bkash, Card, Bank
        public decimal Amount { get; set; }
        public string? TransactionId { get; set; }
    }

    public class SalesDetail : TenantBaseEntity
    {
        public int SalesInvoiceId { get; set; }
        public int InventoryItemId { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal CostPrice { get; set; }
        public decimal CommissionAmount { get; set; } // Actual commission earned for this item
        public int WarrantyMonths { get; set; }
        public decimal Profit => UnitPrice - CostPrice;
    }
}
