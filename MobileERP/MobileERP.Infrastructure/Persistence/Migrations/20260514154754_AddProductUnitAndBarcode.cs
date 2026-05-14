using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductUnitAndBarcode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_MobileDevices_MobileDeviceId",
                table: "PurchaseDetails");

            migrationBuilder.AlterColumn<int>(
                name: "MobileDeviceId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "ProductId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Quantity",
                table: "PurchaseDetails",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Barcode",
                table: "Products",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Unit",
                table: "Products",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseDetails_ProductId",
                table: "PurchaseDetails",
                column: "ProductId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_MobileDevices_MobileDeviceId",
                table: "PurchaseDetails",
                column: "MobileDeviceId",
                principalTable: "MobileDevices",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_Products_ProductId",
                table: "PurchaseDetails",
                column: "ProductId",
                principalTable: "Products",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_MobileDevices_MobileDeviceId",
                table: "PurchaseDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseDetails_Products_ProductId",
                table: "PurchaseDetails");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseDetails_ProductId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "ProductId",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "Quantity",
                table: "PurchaseDetails");

            migrationBuilder.DropColumn(
                name: "Barcode",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "Unit",
                table: "Products");

            migrationBuilder.AlterColumn<int>(
                name: "MobileDeviceId",
                table: "PurchaseDetails",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseDetails_MobileDevices_MobileDeviceId",
                table: "PurchaseDetails",
                column: "MobileDeviceId",
                principalTable: "MobileDevices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
