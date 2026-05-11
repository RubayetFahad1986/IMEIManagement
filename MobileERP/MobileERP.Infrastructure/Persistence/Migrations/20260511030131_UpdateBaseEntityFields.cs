using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBaseEntityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "WarrantyClaims",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "WarrantyClaims",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "WarrantyClaims",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "WarrantyClaims",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "WarrantyClaims",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Users",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Users",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Users",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Users",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Users",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Suppliers",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Suppliers",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Suppliers",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Suppliers",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Suppliers",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "SupplierLedgers",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SupplierLedgers",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "SupplierLedgers",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "SupplierLedgers",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SupplierLedgers",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "StolenDeviceReports",
                newName: "ReporterEmail");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "StolenDeviceReports",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "StolenDeviceReports",
                newName: "IsVerified");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "StolenDeviceReports",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "StolenDeviceReports",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "SalesReturns",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SalesReturns",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "SalesReturns",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "SalesReturns",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SalesReturns",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "SalesReturnDetails",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SalesReturnDetails",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "SalesReturnDetails",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "SalesReturnDetails",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SalesReturnDetails",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "SalesInvoices",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SalesInvoices",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "SalesInvoices",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "SalesInvoices",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SalesInvoices",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "SalesDetails",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "SalesDetails",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "SalesDetails",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "SalesDetails",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "SalesDetails",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "PurchaseReturns",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PurchaseReturns",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "PurchaseReturns",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "PurchaseReturns",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PurchaseReturns",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "PurchaseReturnDetails",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PurchaseReturnDetails",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "PurchaseReturnDetails",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "PurchaseReturnDetails",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PurchaseReturnDetails",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "PurchaseInvoices",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PurchaseInvoices",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "PurchaseInvoices",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "PurchaseInvoices",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PurchaseInvoices",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "PurchaseDetails",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PurchaseDetails",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "PurchaseDetails",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "PurchaseDetails",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "PurchaseDetails",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "MobileDevices",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "MobileDevices",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "MobileDevices",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "MobileDevices",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "MobileDevices",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "JournalVouchers",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "JournalVouchers",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "JournalVouchers",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "JournalVouchers",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "JournalVouchers",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "JournalEntries",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "JournalEntries",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "JournalEntries",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "JournalEntries",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "JournalEntries",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Inventory",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Inventory",
                newName: "WarrantyExpiryDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Inventory",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Inventory",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Inventory",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Customers",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Customers",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Customers",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Customers",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Customers",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "CustomerLedgers",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "CustomerLedgers",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "CustomerLedgers",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "CustomerLedgers",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "CustomerLedgers",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Companies",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Companies",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Companies",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Companies",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Companies",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Brands",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "Brands",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Brands",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "Brands",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "Brands",
                newName: "CreateDate");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "AccountHeads",
                newName: "LuserIdUpdate");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "AccountHeads",
                newName: "UpdateDate");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "AccountHeads",
                newName: "IsDelete");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "AccountHeads",
                newName: "LuserId");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "AccountHeads",
                newName: "CreateDate");

            migrationBuilder.AddColumn<string>(
                name: "ClaimId",
                table: "StolenDeviceReports",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GDDocumentPath",
                table: "StolenDeviceReports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDelete",
                table: "StolenDeviceReports",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LuserId",
                table: "StolenDeviceReports",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyMonths",
                table: "SalesDetails",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdateDate",
                table: "Inventory",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_MobileDeviceId",
                table: "Inventory",
                column: "MobileDeviceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_MobileDevices_MobileDeviceId",
                table: "Inventory",
                column: "MobileDeviceId",
                principalTable: "MobileDevices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_MobileDevices_MobileDeviceId",
                table: "Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_MobileDeviceId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "ClaimId",
                table: "StolenDeviceReports");

            migrationBuilder.DropColumn(
                name: "GDDocumentPath",
                table: "StolenDeviceReports");

            migrationBuilder.DropColumn(
                name: "IsDelete",
                table: "StolenDeviceReports");

            migrationBuilder.DropColumn(
                name: "LuserId",
                table: "StolenDeviceReports");

            migrationBuilder.DropColumn(
                name: "WarrantyMonths",
                table: "SalesDetails");

            migrationBuilder.DropColumn(
                name: "UpdateDate",
                table: "Inventory");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "WarrantyClaims",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "WarrantyClaims",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "WarrantyClaims",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "WarrantyClaims",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "WarrantyClaims",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "Users",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "Users",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "Users",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "Users",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Users",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "Suppliers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "Suppliers",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "Suppliers",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "Suppliers",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Suppliers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "SupplierLedgers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "SupplierLedgers",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "SupplierLedgers",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "SupplierLedgers",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "SupplierLedgers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "StolenDeviceReports",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "ReporterEmail",
                table: "StolenDeviceReports",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "StolenDeviceReports",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsVerified",
                table: "StolenDeviceReports",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "StolenDeviceReports",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "SalesReturns",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "SalesReturns",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "SalesReturns",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "SalesReturns",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "SalesReturns",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "SalesReturnDetails",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "SalesReturnDetails",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "SalesReturnDetails",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "SalesReturnDetails",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "SalesReturnDetails",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "SalesInvoices",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "SalesInvoices",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "SalesInvoices",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "SalesInvoices",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "SalesInvoices",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "SalesDetails",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "SalesDetails",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "SalesDetails",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "SalesDetails",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "SalesDetails",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "PurchaseReturns",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "PurchaseReturns",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "PurchaseReturns",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "PurchaseReturns",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "PurchaseReturns",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "PurchaseReturnDetails",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "PurchaseReturnDetails",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "PurchaseReturnDetails",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "PurchaseReturnDetails",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "PurchaseReturnDetails",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "PurchaseInvoices",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "PurchaseInvoices",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "PurchaseInvoices",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "PurchaseInvoices",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "PurchaseInvoices",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "PurchaseDetails",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "PurchaseDetails",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "PurchaseDetails",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "PurchaseDetails",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "PurchaseDetails",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "MobileDevices",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "MobileDevices",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "MobileDevices",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "MobileDevices",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "MobileDevices",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "JournalVouchers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "JournalVouchers",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "JournalVouchers",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "JournalVouchers",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "JournalVouchers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "JournalEntries",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "JournalEntries",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "JournalEntries",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "JournalEntries",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "JournalEntries",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "WarrantyExpiryDate",
                table: "Inventory",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "Inventory",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "Inventory",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "Inventory",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Inventory",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "Customers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "Customers",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "Customers",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "Customers",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Customers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "CustomerLedgers",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "CustomerLedgers",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "CustomerLedgers",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "CustomerLedgers",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "CustomerLedgers",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "Companies",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "Companies",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "Companies",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "Companies",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Companies",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "Brands",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "Brands",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "Brands",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "Brands",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "Brands",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdateDate",
                table: "AccountHeads",
                newName: "UpdatedAt");

            migrationBuilder.RenameColumn(
                name: "LuserIdUpdate",
                table: "AccountHeads",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "LuserId",
                table: "AccountHeads",
                newName: "CreatedBy");

            migrationBuilder.RenameColumn(
                name: "IsDelete",
                table: "AccountHeads",
                newName: "IsDeleted");

            migrationBuilder.RenameColumn(
                name: "CreateDate",
                table: "AccountHeads",
                newName: "CreatedAt");
        }
    }
}
