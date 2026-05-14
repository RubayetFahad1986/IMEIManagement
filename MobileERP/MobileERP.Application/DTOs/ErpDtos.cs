using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System;

namespace MobileERP.Application.DTOs
{
    public class LoginRequest { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }

    public class PurchaseRequest
    {
        public int SupplierId { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public List<PurchaseItemDto> Items { get; set; } = new();
    }
    public class PurchaseItemDto
    {
        public int? Id { get; set; }
        public int? MobileDeviceId { get; set; }
        public int? ProductId { get; set; }
        public decimal Quantity { get; set; } = 1;
        public List<ImeiItemDto> ImeiItems { get; set; } = new List<ImeiItemDto>();
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal CommissionAmount { get; set; }
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
        public string? WarrantyRemarks { get; set; }
    }

    public class ImeiItemDto
    {
        public int? Id { get; set; }
        public string IMEI1 { get; set; } = string.Empty;
        public string? IMEI2 { get; set; }
        public string? SerialNumber { get; set; }
    }

    public class CommissionPaymentRequest
    {
        public int EmployeeId { get; set; }
        public decimal Amount { get; set; }
        public int PaymentAccountId { get; set; } // Cash/Bank
        public string? Remarks { get; set; }
    }

    public class SalesRequest
    {
        public string? InvoiceNo { get; set; }
        public int? CustomerId { get; set; }
        public int? SalesPersonId { get; set; }
        public decimal Discount { get; set; }
        public decimal ServiceCharge { get; set; }
        public decimal VAT { get; set; }
        public decimal PaidAmount { get; set; }
        public List<SalesItemDto> Items { get; set; } = new();
        
        // --- Walk-in Customer Info ---
        public string? WalkInName { get; set; }
        public string? WalkInPhone { get; set; }
        public string? WalkInAddress { get; set; }
        
        // --- Exchange Support ---
        public bool IsExchange { get; set; }
        public List<int> ReturningInventoryItemIds { get; set; } = new(); 
        public decimal ExchangeValue { get; set; } 
    }

    public class SalesItemDto
    {
        public int InventoryItemId { get; set; }
        public int WarrantyMonths { get; set; }
        public decimal? UnitPrice { get; set; }
    }

    public class WarrantyRequest
    {
        public int InventoryItemId { get; set; }
        public int CustomerId { get; set; }
        public string IssueDescription { get; set; } = string.Empty;
    }

    public class SalesReturnRequest
    {
        public int SalesInvoiceId { get; set; }
        public List<int> InventoryItemIds { get; set; } = new();
        public string? Reason { get; set; }
    }

    public class PurchaseReturnRequest
    {
        public int PurchaseInvoiceId { get; set; }
        public List<int> InventoryItemIds { get; set; } = new();
        public string? Reason { get; set; }
    }

    public class StolenReportRequest
    {
        public string IMEI1 { get; set; } = string.Empty;
        public string? IMEI2 { get; set; }
        public string BrandModel { get; set; } = string.Empty;
        public string ReporterName { get; set; } = string.Empty;
        public string ReporterPhone { get; set; } = string.Empty;
        public string? ReporterEmail { get; set; }
        public string? PoliceStation { get; set; }
    }

    public class GDUploadRequest
    {
        public string ClaimId { get; set; } = string.Empty;
        public string GDNumber { get; set; } = string.Empty;
        public IFormFile? File { get; set; }
    }

    public class ExpenseRequest
    {
        public string? VoucherNo { get; set; }
        public int PaymentAccountId { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? Remarks { get; set; }
        public List<ExpenseDetailDto> Details { get; set; } = new();
    }

    public class ExpenseDetailDto
    {
        public int ExpenseAccountId { get; set; }
        public decimal Amount { get; set; }
        public string? Note { get; set; }
    }

    public class BalanceAdjustmentRequest
    {
        public int ContactId { get; set; }
        public decimal AdjustmentAmount { get; set; }
        public string Direction { get; set; } = string.Empty; // CustToSupp, SuppToCust
        public string? Remarks { get; set; }
    }

    public class ContactPaymentRequest
    {
        public int ContactId { get; set; }
        public decimal Amount { get; set; }
        public int PaymentAccountId { get; set; } // Cash/Bank Account Head
        public string TransactionType { get; set; } = "Receipt"; // Receipt (from Customer), Payment (to Supplier)
        public DateTime TransactionDate { get; set; }
        public string? Remarks { get; set; }
        public string? ReferenceNo { get; set; }
    }

    public class DueCollectionRequest
    {
        public int ContactId { get; set; }
        public decimal TotalAmount { get; set; }
        public int PaymentAccountId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Remarks { get; set; }
        public List<InvoiceAllocation>? Allocations { get; set; } // Map of InvoiceId -> Amount
    }

    public class InvoiceAllocation
    {
        public int InvoiceId { get; set; }
        public decimal Amount { get; set; }
        public string InvoiceType { get; set; } = "Sale"; // Sale or Purchase
    }

    public class SmartTransactionRequest
    {
        public string TransactionType { get; set; } = string.Empty; // Expense, Income, Asset, Contra, EmployeeLoan
        public int? DebitAccountId { get; set; }
        public int? CreditAccountId { get; set; }
        public decimal Amount { get; set; }
        public DateTime TransactionDate { get; set; }
        public string? Remarks { get; set; }
        public string? ReferenceNo { get; set; }
        public int? EmployeeId { get; set; } // For employee loans
    }

    public class RegistrationRequest
    {
        public string CompanyName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string AdminFullName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PlanType { get; set; } = "Monthly"; // Monthly, Quarterly, HalfYearly, Yearly
        public string? PromoCode { get; set; }
    }

    public class OtpVerificationRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class LoginResponse
    {
        public string Token { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int ComId { get; set; }
        public bool IsShowCosting { get; set; }
        public bool CanSeeOthersEntry { get; set; }
        public DateTime? SubscriptionExpiryDate { get; set; }
        public bool IsNearExpiry { get; set; }
        public bool IsExpired { get; set; }
        public string? Message { get; set; }
    }

    public class SeedCustomRequest
    {
        public string BusinessType { get; set; } = string.Empty; // Mobile, Computer, Grocery, MotorParts, Clothing
        public List<string> Tables { get; set; } = new List<string>(); // Contacts, Products, MobileDevices, Categories, Brands, Accounts
    }

    public class StockAuditRequest
    {
        public string? Remarks { get; set; }
        public List<StockAuditItemDto> Items { get; set; } = new();
    }

    public class StockAuditItemDto
    {
        public int InventoryItemId { get; set; }
        public decimal PhysicalQuantity { get; set; }
        public bool IsPresent { get; set; } // For IMEI tracked items
    }
}
