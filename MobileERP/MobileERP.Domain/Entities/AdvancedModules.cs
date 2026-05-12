using System;
using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    // --- Global Master Data ---
    public class GlobalMobileMaster : BaseEntity
    {
        public string OEM { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public string? NetworkTechnology { get; set; }
        public string? LaunchAnnounced { get; set; }
        public string? BodyDimensions { get; set; }
        public string? BodyWeight { get; set; }
        public string? BodySim { get; set; }
        public string? DisplayType { get; set; }
        public string? DisplaySize { get; set; }
        public string? DisplayResolution { get; set; }
        public string? MemoryCardSlot { get; set; }
        public string? MemoryInternal { get; set; }
        public string? MainCameraSingle { get; set; }
        public string? MainCameraVideo { get; set; }
        public string? SelfieCameraSingle { get; set; }
        public string? PlatformOs { get; set; }
        public string? PlatformChipset { get; set; }
        public string? PlatformCpu { get; set; }
        public string? PlatformGpu { get; set; }
        public string? MiscColors { get; set; }
        public string? MiscPrice { get; set; }
        public string? Battery { get; set; }
    }

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
