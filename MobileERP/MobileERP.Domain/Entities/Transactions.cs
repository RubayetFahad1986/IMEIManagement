using MobileERP.Domain.Common;
using System;
using System.Collections.Generic;

namespace MobileERP.Domain.Entities
{
    public class Contact : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
        
        // --- Role Flags ---
        public bool IsCustomer { get; set; }
        public bool IsSupplier { get; set; }

        // --- Identity Info (Mainly for Customers/Trade-ins) ---
        public string? NID { get; set; }
        public string? Passport { get; set; }
        public string? DrivingLicense { get; set; }

        // --- Financials ---
        public decimal OpeningBalance { get; set; }
        public decimal CustomerBalance { get; set; } // What they owe us
        public decimal SupplierBalance { get; set; } // What we owe them
        public decimal NetBalance => CustomerBalance - SupplierBalance;
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
        public string? Barcode { get; set; }
        public string? Unit { get; set; } // Kg, Pcs, Box, Litre
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
        public int? MobileDeviceId { get; set; }
        public MobileDevice? MobileDevice { get; set; }
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal Quantity { get; set; } = 1;
        public ICollection<ImeiItem> ImeiItems { get; set; } = new List<ImeiItem>();
        public ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();
        public string? BatteryHealth { get; set; }
        public string? Condition { get; set; }

        // --- New Master Data ---
        public int? WarrantyTypeId { get; set; }
        public int? WarrantyDurationId { get; set; }
        public int? WarrantyCoverageId { get; set; }
        public int? ConditionId { get; set; }
        public int? MarketTypeId { get; set; }
        public string? WarrantyRemarks { get; set; }
    }

    public class ImeiItem : TenantBaseEntity
    {
        public int PurchaseDetailId { get; set; }
        public string IMEI1 { get; set; } = string.Empty;
        public string? IMEI2 { get; set; }
        public string? SerialNumber { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class InventoryItem : TenantBaseEntity
    {
        public int? PurchaseDetailId { get; set; }
        public PurchaseDetail? PurchaseDetail { get; set; }
        public int? MobileDeviceId { get; set; }
        public MobileDevice? MobileDevice { get; set; }
        public int? ProductId { get; set; }
        public Product? Product { get; set; }
        public int? ImeiItemId { get; set; }
        public ImeiItem? ImeiItem { get; set; }
        public string? IMEI1 { get; set; }
        public string? IMEI2 { get; set; }
        public string? SerialNumber { get; set; }
        public decimal CostPrice { get; set; }
        public decimal CurrentSalePrice { get; set; }
        public decimal CommissionAmount { get; set; } // Default commission for selling this unit
        public decimal Quantity { get; set; } = 1;
        public bool IsSold { get; set; }
        public int? PurchaseInvoiceId { get; set; }
        public PurchaseInvoice? PurchaseInvoice { get; set; }
        public int? SalesInvoiceId { get; set; }
        public int? BranchId { get; set; }
        public string Condition { get; set; } = "New"; // Deprecated
        public string BoxStatus { get; set; } = "Intact"; // Deprecated
        public bool IsOfficial { get; set; } = true; // Deprecated
        public int WarrantyMonths { get; set; } // Deprecated
        
        // --- New Master Data ---
        public int? WarrantyTypeId { get; set; }
        public int? WarrantyDurationId { get; set; }
        public int? WarrantyCoverageId { get; set; }
        public int? ConditionId { get; set; }
        public int? MarketTypeId { get; set; }
        public DateTime? WarrantyStartDate { get; set; }
        public DateTime? WarrantyEndDate { get; set; }
        public string? WarrantyRemarks { get; set; }
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
        public InventoryItem? InventoryItem { get; set; }
    }

    public class SalesInvoice : TenantBaseEntity
    {
        public string InvoiceNo { get; set; } = string.Empty;
        public DateTime SalesDate { get; set; }
        public int? CustomerId { get; set; }
        public int? SalesPersonId { get; set; } // Linked to Employee
        public decimal SubTotal { get; set; }
        public decimal Discount { get; set; }
        public decimal ServiceCharge { get; set; }
        public decimal VAT { get; set; }
        public decimal NetTotal { get; set; }
        public decimal PaidAmount { get; set; }
        public decimal ChangeAmount { get; set; }
        
        // --- Walk-in Customer Info ---
        public string? WalkInName { get; set; }
        public string? WalkInPhone { get; set; }
        public string? WalkInAddress { get; set; }

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
        public InventoryItem? InventoryItem { get; set; }
        public int? ImeiItemId { get; set; }
        public ImeiItem? ImeiItem { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal CostPrice { get; set; }
        public decimal CommissionAmount { get; set; } // Actual commission earned for this item
        public int WarrantyMonths { get; set; }
        public decimal Profit => UnitPrice - CostPrice;
    }
}
