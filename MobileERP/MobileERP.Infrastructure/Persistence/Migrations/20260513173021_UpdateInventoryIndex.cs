using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInventoryIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Inventory_IMEI1",
                table: "Inventory");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_IMEI1",
                table: "Inventory",
                column: "IMEI1",
                unique: true,
                filter: "\"IsDelete\" = false");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Inventory_IMEI1",
                table: "Inventory");

            migrationBuilder.CreateIndex(
                name: "IX_Inventory_IMEI1",
                table: "Inventory",
                column: "IMEI1",
                unique: true);
        }
    }
}
