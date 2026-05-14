using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixSchemaDrift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Inventory_PurchaseInvoiceId",
                table: "Inventory",
                column: "PurchaseInvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_PurchaseInvoices_PurchaseInvoiceId",
                table: "Inventory",
                column: "PurchaseInvoiceId",
                principalTable: "PurchaseInvoices",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_PurchaseInvoices_PurchaseInvoiceId",
                table: "Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_PurchaseInvoiceId",
                table: "Inventory");
        }
    }
}
