using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePurchaseChildRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PurchaseDetailId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_PurchaseDetailId",
                table: "Inventory",
                column: "PurchaseDetailId");

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_PurchaseDetails_PurchaseDetailId",
                table: "Inventory",
                column: "PurchaseDetailId",
                principalTable: "PurchaseDetails",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_PurchaseDetails_PurchaseDetailId",
                table: "Inventory");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_PurchaseDetailId",
                table: "Inventory");

            migrationBuilder.DropColumn(
                name: "PurchaseDetailId",
                table: "Inventory");
        }
    }
}
