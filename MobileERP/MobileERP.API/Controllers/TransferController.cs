using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransferController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransferController(ApplicationDbContext context)
        {
            _context = context;
        }

        private async Task LogProductHistory(int itemId, string type, string refNo, string desc, int? fromBranch = null, int? toBranch = null)
        {
            _context.ProductHistories.Add(new ProductHistory { InventoryItemId = itemId, EventDate = DateTime.UtcNow, EventType = type, ReferenceNo = refNo, Description = desc, FromBranchId = fromBranch, ToBranchId = toBranch, ComId = 1 });
        }

        [HttpGet]
        public async Task<IActionResult> GetTransfers(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<BranchTransfer> query = _context.BranchTransfers
                .Include(t => t.Details)
                    .ThenInclude(d => d.InventoryItem)
                        .ThenInclude(i => i.MobileDevice)
                .Include(t => t.Details)
                    .ThenInclude(d => d.InventoryItem)
                        .ThenInclude(i => i.Product)
                .Where(t => !t.IsDelete);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(t => t.Remarks != null && t.Remarks.ToLower().Contains(search));
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(t => t.TransferDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                Items = items,
                TotalCount = totalCount,
                PageNumber = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransfer(BranchTransfer request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfer = new BranchTransfer
                {
                    FromBranchId = request.FromBranchId,
                    ToBranchId = request.ToBranchId,
                    TransferDate = request.TransferDate.ToUniversalTime(),
                    Remarks = request.Remarks,
                    Status = "Sent",
                    ComId = 1
                };

                foreach (var detail in request.Details)
                {
                    var inventoryItem = await _context.Inventory
                        .FirstOrDefaultAsync(i => i.Id == detail.InventoryItemId);

                    if (inventoryItem == null) return BadRequest($"Inventory item {detail.InventoryItemId} not found.");

                    // Move inventory
                    inventoryItem.BranchId = request.ToBranchId;
                    await LogProductHistory(detail.InventoryItemId, "Transfer", "TRF-" + DateTime.UtcNow.Ticks, $"Transferred from branch {request.FromBranchId} to {request.ToBranchId}", request.FromBranchId, request.ToBranchId);

                    transfer.Details.Add(new BranchTransferDetail
                    {
                        InventoryItemId = detail.InventoryItemId,
                        ComId = 1
                    });
                }

                _context.BranchTransfers.Add(transfer);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Transfer completed successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTransfer(int id)
        {
            var transfer = await _context.BranchTransfers
                .Include(t => t.Details)
                    .ThenInclude(d => d.InventoryItem)
                        .ThenInclude(i => i.MobileDevice)
                .Include(t => t.Details)
                    .ThenInclude(d => d.InventoryItem)
                        .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(t => t.Id == id);
            
            if (transfer == null) return NotFound("Transfer not found.");
            return Ok(transfer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransfer(int id, BranchTransfer request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfer = await _context.BranchTransfers
                    .Include(t => t.Details)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (transfer == null) return NotFound("Transfer not found.");

                // Rollback previous inventory branch changes
                foreach (var detail in transfer.Details)
                {
                    var item = await _context.Inventory.FirstOrDefaultAsync(i => i.Id == detail.InventoryItemId);
                    if (item != null) item.BranchId = transfer.FromBranchId;
                }

                // Apply new changes
                transfer.FromBranchId = request.FromBranchId;
                transfer.ToBranchId = request.ToBranchId;
                transfer.TransferDate = request.TransferDate.ToUniversalTime();
                transfer.Remarks = request.Remarks;

                _context.BranchTransferDetails.RemoveRange(transfer.Details);
                foreach (var detail in request.Details)
                {
                    var item = await _context.Inventory.FirstOrDefaultAsync(i => i.Id == detail.InventoryItemId);
                    if (item != null)
                    {
                        item.BranchId = request.ToBranchId;
                        await LogProductHistory(item.Id, "TransferUpdate", "TRF-EDIT-" + transfer.Id, $"Transfer updated: Moved to {request.ToBranchId}", transfer.FromBranchId, request.ToBranchId);
                    }

                    transfer.Details.Add(new BranchTransferDetail
                    {
                        InventoryItemId = detail.InventoryItemId,
                        ComId = 1
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Transfer updated successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransfer(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var transfer = await _context.BranchTransfers
                    .Include(t => t.Details)
                    .FirstOrDefaultAsync(t => t.Id == id);

                if (transfer == null) return NotFound("Transfer not found.");

                // Reverse inventory branch changes
                foreach (var detail in transfer.Details)
                {
                    var item = await _context.Inventory.FirstOrDefaultAsync(i => i.Id == detail.InventoryItemId);
                    if (item != null)
                    {
                        item.BranchId = transfer.FromBranchId;
                        await LogProductHistory(item.Id, "TransferDelete", "TRF-DEL-" + transfer.Id, "Transfer cancelled, item returned to source branch", transfer.ToBranchId, transfer.FromBranchId);
                    }
                }

                transfer.IsDelete = true;
                foreach (var detail in transfer.Details) detail.IsDelete = true;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Transfer deleted and inventory reversed." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
    }
}
