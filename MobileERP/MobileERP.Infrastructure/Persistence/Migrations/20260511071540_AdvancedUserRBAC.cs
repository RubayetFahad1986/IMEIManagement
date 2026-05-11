using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AdvancedUserRBAC : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CanViewCostPrice",
                table: "Users",
                newName: "IsShowCosting");

            migrationBuilder.AddColumn<bool>(
                name: "CanSeeOthersEntry",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_SalesDetails_InventoryItemId",
                table: "SalesDetails",
                column: "InventoryItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseDetails_MobileDeviceId",
                table: "PurchaseDetails",
                column: "MobileDeviceId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_MobileDevices_MobileDeviceId",
                table: "PurchaseDetails",
                column: "MobileDeviceId",
                principalTable: "MobileDevices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SalesDetails_Inventory_InventoryItemId",
                table: "SalesDetails",
                column: "InventoryItemId",
                principalTable: "Inventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_MobileDevices_MobileDeviceId",
                table: "PurchaseDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesDetails_Inventory_InventoryItemId",
                table: "SalesDetails");

            migrationBuilder.DropIndex(
                name: "IX_SalesDetails_InventoryItemId",
                table: "SalesDetails");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseDetails_MobileDeviceId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "CanSeeOthersEntry",
                table: "Users");

            migrationBuilder.RenameColumn(
                name: "IsShowCosting",
                table: "Users",
                newName: "CanViewCostPrice");
        }
    }
}
