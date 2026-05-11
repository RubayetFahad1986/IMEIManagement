# Mobile IMEI Management SaaS ERP - System Architecture & Developer Guide

## 1. Project Overview
A cloud-based SaaS ERP platform designed specifically for mobile phone businesses worldwide. The system handles IMEI inventory, point-of-sale (POS), comprehensive accounting, trade-ins (exchanges), and stolen IMEI tracking. 

## 2. Technology Stack
- **Backend Framework:** .NET 9 Web API, C#
- **ORM:** Entity Framework Core 10
- **Database:** PostgreSQL (with Multi-tenant architecture)
- **Caching:** Redis (StackExchange.Redis)
- **Real-time:** SignalR
- **Authentication:** JWT (JSON Web Tokens) with Refresh Tokens
- **Containerization:** Docker
- **Frontend (Planned):** Next.js, React, TypeScript, Tailwind CSS

## 3. SaaS Multi-Tenant Architecture
The database follows a "Single Database, Shared Schema" multi-tenant approach.
- **Tenant Isolation:** Every tenant-specific table contains a `ComId` (Company ID) column. Entity Framework Core Global Query Filters will automatically append `WHERE ComId = @CurrentComId` to all queries, ensuring data isolation.
- **Global Reference Data:** Tables intended to be shared globally (e.g., standard Mobile Brands, Models, Categories like "Used", "With Box") will have a nullable `ComId`.
  - If `ComId` is `null`, the record is global and read-only for tenants.
  - If `ComId` has a value, it's a custom reference created by that specific tenant.

## 4. User Roles & Permissions
- **Super Admin:** Can manage the platform, view all companies, and add/edit global reference data.
- **Company Admin:** Full control within their specific company/tenant. Can manage users, view all reports, purchase, and sell.
- **Admin:** Similar to Company Admin but restricted from some billing/tenant configuration settings.
- **User:** General employee. 
  - *Permissions:* Configurable access (e.g., viewing Cost Price, creating Sales, doing Exchanges).
  - *Data Scope:* Can only see sales/transactions created by them within the current date or last 1 month unless granted broader permissions.

## 5. Core Modules

### 5.1 Global Mobile Master Database
- Preloaded brands (Apple, Samsung, etc.), models (iPhone 15, S24 Ultra), variants (Color, RAM/Storage).
- Support for SKU and Barcodes. Accessories like adapters and headphones can also be added by users.

### 5.2 IMEI Inventory System
- Each IMEI is tracked uniquely (IMEI1, IMEI2, Serial Number).
- Captures Condition, Battery Health, Warehouse Location, Cost Price, and Sale Price.
- Categories include: New, Used, WithBox, WithoutBox, Official, Unofficial.

### 5.3 Purchase Module
- Handles Purchase Invoices and Supplier Accounts.
- Bulk IMEI import and barcode scanning support.
- Purchase Returns and Automatic Accounting Journal creation.

### 5.4 Sales Module (POS)
- POS interface with quick IMEI search and barcode scan.
- Walk-in customer support (Name, Phone, Address required).
- Payment tracking (Cash, Bank, Installment, Multiple payments).
- Profit calculation per IMEI.

### 5.5 Exchange / Trade-In Module
- Replaces an old phone with a new one.
- Customer provides NID/Passport/Driving License. The system stores and prints a legal document for the trade-in.
- Adjusts inventory, customer ledger, and accounting ledgers.

### 5.6 Used Device Tracking
- Records Battery Health, Face ID, Fingerprint, Body Condition, Warranty Status, and Repair History.

### 5.7 Accounting & Cash/Bank Management
- Chart of Accounts, Journal Vouchers, Ledgers, Trial Balance, Profit & Loss, Balance Sheet.
- Daily Cash Receive, Bank Receive, Due Collection, Supplier Payment.

### 5.8 Stolen IMEI Alert System
- Allows reporting a stolen IMEI with a Police GD (General Diary) copy and contact info.
- If the IMEI is scanned or entered in any tenant's system worldwide, an alert (email/mobile) is triggered to the original owner.

## 6. Backend Solution Structure (.NET Clean Architecture)
The project `MobileERP` has been initialized with the following structure:
- **`MobileERP.API`**: Controllers, Middleware, JWT config, Dependency Injection.
- **`MobileERP.Application`**: CQRS implementation (MediatR), DTOs, FluentValidation, Business Interfaces.
- **`MobileERP.Domain`**: Core entities, Enums, Exceptions, and Repository Interfaces.
- **`MobileERP.Infrastructure`**: EF Core DbContext, Migrations, Repositories, PostgreSQL connection, Redis connection.
- **`MobileERP.Shared`**: Common utilities, Constants, Extensions.

## 7. Next Steps for Development (AI Prompts)
To continue building this software with an AI assistant (Claude or Gemini), use the following phases:

**Phase 1: Domain Models & EF Core Setup**
- Create `TenantBaseEntity` containing `ComId` and Audit fields (CreatedBy, CreatedAt).
- Create entities for `Company`, `User`, `Role`, `Brand`, `Model`, `Variant`, `Category`.
- Configure `ApplicationDbContext` in the Infrastructure layer with Global Query Filters for `ComId`.

**Phase 2: Authentication & Multi-Tenancy Resolution**
- Implement JWT generation and validation.
- Create a middleware to extract `ComId` from the logged-in user's token and set it in a scoped `ITenantService`.

**Phase 3: Inventory & Purchases**
- Create `PurchaseInvoice`, `PurchaseDetail`, `InventoryItem` (IMEI specific) entities.
- Implement MediatR Handlers for creating purchases and stocking IMEIs.

**Phase 4: Sales, Exchange & Accounting**
- Implement POS endpoints.
- Ensure accounting journals are hit using domain events when a sale or purchase is finalized.
- Implement PDF generation for Exchange documents.

**Phase 5: Stolen IMEI Service**
- Implement cross-tenant search for Stolen IMEIs via background workers or global lookups bypassing the `ComId` filter temporarily for matches.
