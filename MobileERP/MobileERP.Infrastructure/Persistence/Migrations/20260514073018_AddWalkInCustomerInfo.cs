using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddWalkInCustomerInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "WalkInAddress",
                table: "SalesInvoices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WalkInName",
                table: "SalesInvoices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WalkInPhone",
                table: "SalesInvoices",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "WalkInAddress",
                table: "SalesInvoices");

            migrationBuilder.DropColumn(
                name: "WalkInName",
                table: "SalesInvoices");

            migrationBuilder.DropColumn(
                name: "WalkInPhone",
                table: "SalesInvoices");
        }
    }
}
