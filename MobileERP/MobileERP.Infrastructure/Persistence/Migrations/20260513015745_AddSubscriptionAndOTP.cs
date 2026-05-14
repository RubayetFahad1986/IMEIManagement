using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSubscriptionAndOTP : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsVerified",
                table: "Companies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PlanType",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "SubscriptionExpiryDate",
                table: "Companies",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VerificationOtp",
                table: "Companies",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsVerified",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "PlanType",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "SubscriptionExpiryDate",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "VerificationOtp",
                table: "Companies");
        }
    }
}
