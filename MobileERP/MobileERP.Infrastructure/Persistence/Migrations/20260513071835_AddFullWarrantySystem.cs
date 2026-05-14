using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFullWarrantySystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "WarrantyExpiryDate",
                table: "Inventory",
                newName: "WarrantyStartDate");

            migrationBuilder.AddColumn<int>(
                name: "ConditionId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MarketTypeId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyCoverageId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyDurationId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyRemarks",
                table: "PurchaseDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyTypeId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ConditionId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MarketTypeId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyCoverageId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyDurationId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "WarrantyEndDate",
                table: "Inventory",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WarrantyRemarks",
                table: "Inventory",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "WarrantyTypeId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MarketTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ComId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarketTypes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductConditions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ComId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductConditions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyCoverages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ComId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyCoverages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyDurations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Days = table.Column<int>(type: "integer", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ComId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyDurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WarrantyTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ComId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WarrantyTypes", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarketTypes");

            migrationBuilder.DropTable(
                name: "ProductConditions");

            migrationBuilder.DropTable(
                name: "WarrantyCoverages");

            migrationBuilder.DropTable(
                name: "WarrantyDurations");

            migrationBuilder.DropTable(
                name: "WarrantyTypes");

            migrationBuilder.DropColumn(
                name: "ConditionId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "MarketTypeId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "WarrantyCoverageId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "WarrantyDurationId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "WarrantyRemarks",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "WarrantyTypeId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "ConditionId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "MarketTypeId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "WarrantyCoverageId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "WarrantyDurationId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "WarrantyEndDate",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "WarrantyRemarks",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "WarrantyTypeId",
                table: "Inventory");

            migrationBuilder.RenameColumn(
                name: "WarrantyStartDate",
                table: "Inventory",
                newName: "WarrantyExpiryDate");
        }
    }
}
