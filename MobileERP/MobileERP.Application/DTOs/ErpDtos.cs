using Microsoft.AspNetCore.Http;

namespace MobileERP.Application.DTOs
{
    public class LoginRequest { public string Username { get; set; } = string.Empty; public string Password { get; set; } = string.Empty; }
    public class LoginResponse { public string Token { get; set; } = string.Empty; public string FullName { get; set; } = string.Empty; public string Role { get; set; } = string.Empty; public int ComId { get; set; } public bool IsShowCosting { get; set; } public bool CanSeeOthersEntry { get; set; } }

    public class PurchaseRequest
    {
        public int SupplierId { get; set; }
        public string InvoiceNo { get; set; } = string.Empty;
        public decimal PaidAmount { get; set; }
        public List<PurchaseItemDto> Items { get; set; } = new();
    }
    public class PurchaseItemDto
    {
        public int MobileDeviceId { get; set; }
        public string IMEI1 { get; set; } = string.Empty;
        public string? IMEI2 { get; set; }
        public decimal CostPrice { get; set; }
        public decimal SalePrice { get; set; }
        public decimal CommissionAmount { get; set; }
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
        public decimal PaidAmount { get; set; }
        public List<SalesItemDto> Items { get; set; } = new();
        
        // --- Exchange Support ---
        public bool IsExchange { get; set; }
        public List<int> ReturningInventoryItemIds { get; set; } = new(); 
        public decimal ExchangeValue { get; set; } 
    }

    public class SalesItemDto
    {
        public int InventoryItemId { get; set; }
        public int WarrantyMonths { get; set; }
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
}
