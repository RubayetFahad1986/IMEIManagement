using System;
using System.Collections.Generic;
using MobileERP.Domain.Common;

namespace MobileERP.Domain.Entities
{
    public class AccountCategory : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty; // e.g., Assets, Liabilities, Income, Expense
        public string Code { get; set; } = string.Empty; // e.g., 100, 200, 300, 400
        public ICollection<AccountHead> AccountHeads { get; set; } = new List<AccountHead>();
    }

    public class AccountHead : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public int AccountCategoryId { get; set; }
        public AccountCategory? Category { get; set; }
        public string AccountType { get; set; } = string.Empty; // Cash, Bank, General
        public decimal CurrentBalance { get; set; }
        public bool IsDefault { get; set; } // True if seeded by system
    }

    public class JournalVoucher : TenantBaseEntity
    {
        public string VoucherNo { get; set; } = string.Empty;
        public DateTime VoucherDate { get; set; }
        public string ReferenceType { get; set; } = string.Empty; // Purchase, Sale, Expense, Payment, Receipt
        public string ReferenceNo { get; set; } = string.Empty;
        public string? Remarks { get; set; }
        public ICollection<JournalEntry> Entries { get; set; } = new List<JournalEntry>();
    }

    public class JournalEntry : TenantBaseEntity
    {
        public int JournalVoucherId { get; set; }
        public int AccountHeadId { get; set; }
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
    }

    // --- Expense Management ---
    public class ExpenseVoucher : TenantBaseEntity
    {
        public string VoucherNo { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public int PaymentAccountId { get; set; } // Cash or Bank Account Head Id
        public decimal TotalAmount { get; set; }
        public string? Remarks { get; set; }
        public ICollection<ExpenseDetail> Details { get; set; } = new List<ExpenseDetail>();
    }

    public class ExpenseDetail : TenantBaseEntity
    {
        public int ExpenseVoucherId { get; set; }
        public int ExpenseAccountId { get; set; } // Expense Account Head Id
        public decimal Amount { get; set; }
        public string? Note { get; set; }
    }

    public class CustomerLedger : TenantBaseEntity
    {
        public int CustomerId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReferenceNo { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }

    public class SupplierLedger : TenantBaseEntity
    {
        public int SupplierId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public string ReferenceNo { get; set; } = string.Empty;
        public decimal Debit { get; set; }
        public decimal Credit { get; set; }
        public decimal Balance { get; set; }
    }
}
