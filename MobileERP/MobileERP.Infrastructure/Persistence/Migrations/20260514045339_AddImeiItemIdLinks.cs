using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddImeiItemIdLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ImeiItem_PurchaseDetails_PurchaseDetailId",
                table: "ImeiItem");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ImeiItem",
                table: "ImeiItem");

            migrationBuilder.RenameTable(
                name: "ImeiItem",
                newName: "ImeiItems");

            migrationBuilder.RenameIndex(
                name: "IX_ImeiItem_PurchaseDetailId",
                table: "ImeiItems",
                newName: "IX_ImeiItems_PurchaseDetailId");

            migrationBuilder.AddColumn<int>(
                name: "ImeiItemId",
                table: "SalesDetails",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ImeiItemId",
                table: "Inventory",
                type: "integer",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_ImeiItems",
                table: "ImeiItems",
                column: "Id");

            migrationBuilder.CreateIndex(
                name: "IX_SalesDetails_ImeiItemId",
                table: "SalesDetails",
                column: "ImeiItemId");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_ImeiItemId",
                table: "Inventory",
                column: "ImeiItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_ImeiItems_PurchaseDetails_PurchaseDetailId",
                table: "ImeiItems",
                column: "PurchaseDetailId",
                principalTable: "PurchaseDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Inventory_ImeiItems_ImeiItemId",
                table: "Inventory",
                column: "ImeiItemId",
                principalTable: "ImeiItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SalesDetails_ImeiItems_ImeiItemId",
                table: "SalesDetails",
                column: "ImeiItemId",
                principalTable: "ImeiItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ImeiItems_PurchaseDetails_PurchaseDetailId",
                table: "ImeiItems");

            migrationBuilder.DropForeignKey(
                name: "FK_Inventory_ImeiItems_ImeiItemId",
                table: "Inventory");

            migrationBuilder.DropForeignKey(
                name: "FK_SalesDetails_ImeiItems_ImeiItemId",
                table: "SalesDetails");

            migrationBuilder.DropIndex(
                name: "IX_SalesDetails_ImeiItemId",
                table: "SalesDetails");

            migrationBuilder.DropIndex(
                name: "IX_Inventory_ImeiItemId",
                table: "Inventory");

            migrationBuilder.DropPrimaryKey(
                name: "PK_ImeiItems",
                table: "ImeiItems");

            migrationBuilder.DropColumn(
                name: "ImeiItemId",
                table: "SalesDetails");

            migrationBuilder.DropColumn(
                name: "ImeiItemId",
                table: "Inventory");

            migrationBuilder.RenameTable(
                name: "ImeiItems",
                newName: "ImeiItem");

            migrationBuilder.RenameIndex(
                name: "IX_ImeiItems_PurchaseDetailId",
                table: "ImeiItem",
                newName: "IX_ImeiItem_PurchaseDetailId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_ImeiItem",
                table: "ImeiItem",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ImeiItem_PurchaseDetails_PurchaseDetailId",
                table: "ImeiItem",
                column: "PurchaseDetailId",
                principalTable: "PurchaseDetails",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
