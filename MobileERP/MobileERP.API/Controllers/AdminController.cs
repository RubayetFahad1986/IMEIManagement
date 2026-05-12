using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AdminController(ApplicationDbContext context) { _context = context; }

        [HttpPost("import-gsm-data")]
        public async Task<IActionResult> ImportGsmData()
        {
            try
            {
                string csvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "gsm.csv");
                if (!System.IO.File.Exists(csvPath)) return BadRequest("gsm.csv not found at " + csvPath);

                // Use a proper CSV parser approach for complex CSV with quotes and commas inside values
                var lines = System.IO.File.ReadLines(csvPath).ToList();
                if (!lines.Any()) return BadRequest("CSV is empty.");

                var header = lines[0].Split(',').Select(h => h.Trim('"').ToLower()).ToList();
                
                int idxOem = header.IndexOf("oem");
                int idxModel = header.IndexOf("model");
                int idxNet = header.IndexOf("network_technology");
                int idxLaunch = header.IndexOf("launch_announced");
                int idxDim = header.IndexOf("body_dimensions");
                int idxWeight = header.IndexOf("body_weight");
                int idxSim = header.IndexOf("body_sim");
                int idxDispType = header.IndexOf("display_type");
                int idxDispSize = header.IndexOf("display_size");
                int idxDispRes = header.IndexOf("display_resolution");
                int idxMemCard = header.IndexOf("memory_card_slot");
                int idxMemInt = header.IndexOf("memory_internal");
                int idxCamMain = header.IndexOf("main_camera_single");
                int idxCamVid = header.IndexOf("main_camera_video");
                int idxCamSelf = header.IndexOf("selfie_camera_single");
                int idxOs = header.IndexOf("platform_os");
                int idxChip = header.IndexOf("platform_chipset");
                int idxCpu = header.IndexOf("platform_cpu");
                int idxGpu = header.IndexOf("platform_gpu");
                int idxColors = header.IndexOf("misc_colors");
                int idxPrice = header.IndexOf("misc_price");
                int idxBattery = header.IndexOf("battery");

                var globalMasters = new List<GlobalMobileMaster>();
                Regex csvParser = new Regex(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                for (int i = 1; i < lines.Count; i++)
                {
                    string[] parts = csvParser.Split(lines[i]).Select(p => p.Trim('"')).ToArray();
                    if (parts.Length < 2) continue;

                    globalMasters.Add(new GlobalMobileMaster
                    {
                        OEM = idxOem >= 0 && idxOem < parts.Length ? parts[idxOem] : "Unknown",
                        Model = idxModel >= 0 && idxModel < parts.Length ? parts[idxModel] : "Unknown",
                        NetworkTechnology = idxNet >= 0 && idxNet < parts.Length ? parts[idxNet] : null,
                        LaunchAnnounced = idxLaunch >= 0 && idxLaunch < parts.Length ? parts[idxLaunch] : null,
                        BodyDimensions = idxDim >= 0 && idxDim < parts.Length ? parts[idxDim] : null,
                        BodyWeight = idxWeight >= 0 && idxWeight < parts.Length ? parts[idxWeight] : null,
                        BodySim = idxSim >= 0 && idxSim < parts.Length ? parts[idxSim] : null,
                        DisplayType = idxDispType >= 0 && idxDispType < parts.Length ? parts[idxDispType] : null,
                        DisplaySize = idxDispSize >= 0 && idxDispSize < parts.Length ? parts[idxDispSize] : null,
                        DisplayResolution = idxDispRes >= 0 && idxDispRes < parts.Length ? parts[idxDispRes] : null,
                        MemoryCardSlot = idxMemCard >= 0 && idxMemCard < parts.Length ? parts[idxMemCard] : null,
                        MemoryInternal = idxMemInt >= 0 && idxMemInt < parts.Length ? parts[idxMemInt] : null,
                        MainCameraSingle = idxCamMain >= 0 && idxCamMain < parts.Length ? parts[idxCamMain] : null,
                        MainCameraVideo = idxCamVid >= 0 && idxCamVid < parts.Length ? parts[idxCamVid] : null,
                        SelfieCameraSingle = idxCamSelf >= 0 && idxCamSelf < parts.Length ? parts[idxCamSelf] : null,
                        PlatformOs = idxOs >= 0 && idxOs < parts.Length ? parts[idxOs] : null,
                        PlatformChipset = idxChip >= 0 && idxChip < parts.Length ? parts[idxChip] : null,
                        PlatformCpu = idxCpu >= 0 && idxCpu < parts.Length ? parts[idxCpu] : null,
                        PlatformGpu = idxGpu >= 0 && idxGpu < parts.Length ? parts[idxGpu] : null,
                        MiscColors = idxColors >= 0 && idxColors < parts.Length ? parts[idxColors] : null,
                        MiscPrice = idxPrice >= 0 && idxPrice < parts.Length ? parts[idxPrice] : null,
                        Battery = idxBattery >= 0 && idxBattery < parts.Length ? parts[idxBattery] : null,
                        CreateDate = DateTime.UtcNow,
                        IsDelete = false
                    });

                    if (globalMasters.Count >= 500)
                    {
                        await _context.GlobalMobileMasters.AddRangeAsync(globalMasters);
                        await _context.SaveChangesAsync();
                        globalMasters.Clear();
                    }
                }

                if (globalMasters.Any())
                {
                    await _context.GlobalMobileMasters.AddRangeAsync(globalMasters);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { Message = "GSM Global data imported successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message, Stack = ex.StackTrace });
            }
        }

        [HttpPost("mega-seed")]
        public async Task<IActionResult> MegaSeed()
        {
            try
            {
                var tablesToTruncate = new[] {
                    "PurchaseReturnDetails", "PurchaseReturns",
                    "SalesReturnDetails", "SalesReturns",
                    "BranchTransferDetails", "BranchTransfers",
                    "SalesPayments", "SalesDetails", "SalesInvoices",
                    "ImeiItem", "PurchaseDetails", "PurchaseInvoices",
                    "JournalEntries", "JournalVouchers",
                    "ExpenseDetails", "ExpenseVouchers",
                    "ContactLedgers", "StolenDeviceReports", "WarrantyClaims",
                    "EmployeeCommissions", "ProductHistories",
                    "Inventory", "MobileDevices", "Products", "Contacts"
                };

                foreach (var table in tablesToTruncate)
                {
                    await _context.Database.ExecuteSqlRawAsync($"TRUNCATE TABLE \"{table}\" CASCADE;");
                }

                string csvPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "Data", "MobileMasterData_MegaBatch.csv");
                if (!System.IO.File.Exists(csvPath)) return BadRequest("CSV file not found at " + csvPath);

                var lines = await System.IO.File.ReadAllLinesAsync(csvPath);
                var devices = new List<MobileDevice>();

                for (int i = 1; i < lines.Length; i++)
                {
                    var line = lines[i];
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    var parts = line.Split(',');
                    if (parts.Length < 7) continue;
                    devices.Add(new MobileDevice { Brand = parts[0].Trim(), ModelName = parts[1].Trim(), ModelNumber = parts[2].Trim(), VariantName = parts[3].Trim(), Color = parts[4].Trim(), RAM = parts[5].Trim(), Storage = parts[6].Trim(), Chipset = parts.Length > 7 ? parts[7].Trim() : "", BatteryCapacity = parts.Length > 8 ? parts[8].Trim() : "", ImageLink = parts.Length > 9 ? parts[9].Trim() : "", DefaultCostPrice = 0, DefaultSalesPrice = 0, ComId = 1, CreateDate = DateTime.UtcNow, IsDelete = false });
                }
                await _context.MobileDevices.AddRangeAsync(devices);
                await _context.SaveChangesAsync();
                return Ok(new { Message = $"Success! Database wiped and {devices.Count} mobile models imported from MegaBatch CSV." });
            } catch (Exception ex) { return BadRequest(new { Error = ex.Message, Stack = ex.StackTrace }); }
        }
    }
}