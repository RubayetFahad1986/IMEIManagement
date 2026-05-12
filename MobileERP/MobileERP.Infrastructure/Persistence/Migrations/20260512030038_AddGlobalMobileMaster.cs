using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace MobileERP.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddGlobalMobileMaster : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GlobalMobileMasters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    OEM = table.Column<string>(type: "text", nullable: false),
                    Model = table.Column<string>(type: "text", nullable: false),
                    NetworkTechnology = table.Column<string>(type: "text", nullable: true),
                    LaunchAnnounced = table.Column<string>(type: "text", nullable: true),
                    BodyDimensions = table.Column<string>(type: "text", nullable: true),
                    BodyWeight = table.Column<string>(type: "text", nullable: true),
                    BodySim = table.Column<string>(type: "text", nullable: true),
                    DisplayType = table.Column<string>(type: "text", nullable: true),
                    DisplaySize = table.Column<string>(type: "text", nullable: true),
                    DisplayResolution = table.Column<string>(type: "text", nullable: true),
                    MemoryCardSlot = table.Column<string>(type: "text", nullable: true),
                    MemoryInternal = table.Column<string>(type: "text", nullable: true),
                    MainCameraSingle = table.Column<string>(type: "text", nullable: true),
                    MainCameraVideo = table.Column<string>(type: "text", nullable: true),
                    SelfieCameraSingle = table.Column<string>(type: "text", nullable: true),
                    PlatformOs = table.Column<string>(type: "text", nullable: true),
                    PlatformChipset = table.Column<string>(type: "text", nullable: true),
                    PlatformCpu = table.Column<string>(type: "text", nullable: true),
                    PlatformGpu = table.Column<string>(type: "text", nullable: true),
                    MiscColors = table.Column<string>(type: "text", nullable: true),
                    MiscPrice = table.Column<string>(type: "text", nullable: true),
                    Battery = table.Column<string>(type: "text", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LuserId = table.Column<string>(type: "text", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LuserIdUpdate = table.Column<string>(type: "text", nullable: true),
                    IsDelete = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalMobileMasters", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_BranchTransferDetails_InventoryItemId",
                table: "BranchTransferDetails",
                column: "InventoryItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_BranchTransferDetails_Inventory_InventoryItemId",
                table: "BranchTransferDetails",
                column: "InventoryItemId",
                principalTable: "Inventory",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BranchTransferDetails_Inventory_InventoryItemId",
                table: "BranchTransferDetails");

            migrationBuilder.DropTable(
                name: "GlobalMobileMasters");

            migrationBuilder.DropIndex(
                name: "IX_BranchTransferDetails_InventoryItemId",
                table: "BranchTransferDetails");
        }
    }
}
