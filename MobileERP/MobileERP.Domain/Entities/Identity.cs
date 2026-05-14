using MobileERP.Domain.Common;
using System.Collections.Generic;

namespace MobileERP.Domain.Entities
{
    public class Company : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? LogoPath { get; set; }
        public string? HeaderImagePath { get; set; }
        public string? TermsAndConditions { get; set; }
        public bool IsActive { get; set; } = true;

        // --- Subscription & Verification ---
        public DateTime? SubscriptionExpiryDate { get; set; }
        public string? PlanType { get; set; } // Monthly, Quarterly, HalfYearly, Yearly
        public bool IsVerified { get; set; } = false;
        public string? VerificationOtp { get; set; }

        // --- Tax & Service Settings ---
        public bool IsVatEnabled { get; set; }
        public decimal VatPercentage { get; set; }
        public bool IsServiceChargeEnabled { get; set; }
        public decimal ServiceChargePercentage { get; set; }

        public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    }

    public class Branch : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public bool IsMainBranch { get; set; }
    }

    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = "User"; // SuperAdmin, CompanyAdmin, Admin, User
        public int? ComId { get; set; } // Null for SuperAdmin
        public int? BranchId { get; set; } // Staff locked to a branch
        public bool IsActive { get; set; } = true;
        public bool IsShowCosting { get; set; } = false; // "Can view cost price"
        public bool CanSeeOthersEntry { get; set; } = true; // "See other person entry"
    }

    public class Employee : TenantBaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Designation { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public int? UserId { get; set; } // Optional link to User for login
        public User? User { get; set; }
        public int? BranchId { get; set; }
        public decimal TotalCommissionEarned { get; set; }
        public decimal TotalCommissionPaid { get; set; }
        public decimal CommissionBalance => TotalCommissionEarned - TotalCommissionPaid;
    }
}
