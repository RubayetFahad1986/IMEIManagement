using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddImeiItemsEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IMEI1",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "IMEI2",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "SerialNumber",
                table: "PurchaseDetails");

            migrationBuilder.CreateTable(
                name: "ImeiItem",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PurchaseDetailId = table.Column<int>(type: "integer", nullable: false),
                    IMEI1 = table.Column<string>(type: "text", nullable: false),
                    IMEI2 = table.Column<string>(type: "text", nullable: true),
                    SerialNumber = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false),
                    ComId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ImeiItem", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ImeiItem_PurchaseDetails_PurchaseDetailId",
                        column: x => x.PurchaseDetailId,
                        principalTable: "PurchaseDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ImeiItem_PurchaseDetailId",
                table: "ImeiItem",
                column: "PurchaseDetailId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ImeiItem");

            migrationBuilder.AddColumn<string>(
                name: "IMEI1",
                table: "PurchaseDetails",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "IMEI2",
                table: "PurchaseDetails",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SerialNumber",
                table: "PurchaseDetails",
                type: "text",
                nullable: true);
        }
    }
}
