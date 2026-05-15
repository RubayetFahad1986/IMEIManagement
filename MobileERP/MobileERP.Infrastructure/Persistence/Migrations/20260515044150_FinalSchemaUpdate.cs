using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FinalSchemaUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ContactId",
                table: "JournalVouchers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReferenceId",
                table: "JournalVouchers",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContactId",
                table: "JournalEntries",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "JournalVouchers");

            migrationBuilder.DropColumn(
                name: "ReferenceId",
                table: "JournalVouchers");

            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "JournalEntries");
        }
    }
}
