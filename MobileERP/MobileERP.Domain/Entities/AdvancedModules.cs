using System;
using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    // --- Returns & Exchanges ---
    public class SalesReturn : TenantBaseEntity
    {
        public int SalesInvoiceId { get; set; }
        public DateTime ReturnDate { get; set; }
        public decimal TotalReturnAmount { get; set; }
        public string? Reason { get; set; }
        public int? ExchangeSalesInvoiceId { get; set; } // If part of an exchange
        public ICollection<SalesReturnDetail> Details { get; set; } = new List<SalesReturnDetail>();
    }

    public class SalesReturnDetail : TenantBaseEntity
    {
        public int SalesReturnId { get; set; }
        public int InventoryItemId { get; set; }
        public decimal RefundAmount { get; set; }
    }

    public class PurchaseReturn : TenantBaseEntity
    {
        public int PurchaseInvoiceId { get; set; }
        public DateTime ReturnDate { get; set; }
        public decimal TotalReturnAmount { get; set; }
        public string? Reason { get; set; }
        public ICollection<PurchaseReturnDetail> Details { get; set; } = new List<PurchaseReturnDetail>();
    }

    public class PurchaseReturnDetail : TenantBaseEntity
    {
        public int PurchaseReturnId { get; set; }
        public int InventoryItemId { get; set; }
        public decimal RefundAmount { get; set; }
    }

    // --- Warranty Management ---
    public class WarrantyClaim : TenantBaseEntity
    {
        public int InventoryItemId { get; set; }
        public int CustomerId { get; set; }
        public DateTime ClaimDate { get; set; }
        public string IssueDescription { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, SentToServiceCenter, Repaired, Replaced, Delivered
        public DateTime? ExpectedDeliveryDate { get; set; }
        public string? ServiceCenterInfo { get; set; }
        public string? RepairNotes { get; set; }
    }

    // --- IMEI Lifecycle Tracking ---
    public class ProductHistory : TenantBaseEntity
    {
        public int InventoryItemId { get; set; }
        public DateTime EventDate { get; set; }
        public string EventType { get; set; } = string.Empty; // Purchase, Transfer, Sale, Return, Warranty
        public string ReferenceNo { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int? FromBranchId { get; set; }
        public int? ToBranchId { get; set; }
        public string? Status { get; set; }
    }

    // --- Commission Management ---
    public class EmployeeCommission : TenantBaseEntity
    {
        public int EmployeeId { get; set; }
        public int? SalesInvoiceId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; } = string.Empty; // Earning, Payment
        public decimal Amount { get; set; }
        public string? Remarks { get; set; }
    }

    // --- Stolen IMEI Registry (Global Feature) ---
    public class StolenDeviceReport : BaseEntity
    {
        public string ClaimId { get; set; } = string.Empty; // Unique ID for the reporter to track/upload
        public string IMEI1 { get; set; } = string.Empty;
        public string? IMEI2 { get; set; }
        public string BrandModel { get; set; } = string.Empty;
        public string ReporterName { get; set; } = string.Empty;
        public string ReporterPhone { get; set; } = string.Empty;
        public string? ReporterEmail { get; set; }
        public string? GDNumber { get; set; } // General Diary/Police Report No.
        public string? PoliceStation { get; set; }
        public string? GDDocumentPath { get; set; } // Path to uploaded PDF/Image
        public bool IsVerified { get; set; } // Becomes true after admin/shop verifies GD copy
        public bool IsRecovered { get; set; }
        public int? ReportedByComId { get; set; } // Which tenant reported it (or null if public)
    }
}
