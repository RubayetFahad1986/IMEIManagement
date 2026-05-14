using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ResellerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ResellerController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- SuperAdmin Actions ---

        [HttpGet("all")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> GetAllResellers()
        {
            var resellers = await _context.Users
                .Where(u => u.Role == "Reseller")
                .Select(u => new { u.Id, u.FullName, u.Email, u.PromoCode, u.AvailableCopies })
                .ToListAsync();
            return Ok(resellers);
        }

        [HttpPost("add-copies")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> AddCopies([FromBody] AddCopiesRequest request)
        {
            var reseller = await _context.Users.FindAsync(request.ResellerId);
            if (reseller == null || reseller.Role != "Reseller") return NotFound("Reseller not found.");

            // Tiered Pricing Logic
            decimal pricePerCopy = request.Quantity switch
            {
                >= 50 => 800,
                >= 20 => 900,
                >= 10 => 1000,
                >= 5 => 1200,
                _ => 1500 // Base price for < 5
            };

            decimal totalPrice = pricePerCopy * request.Quantity;

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                reseller.AvailableCopies += request.Quantity;
                
                var tx = new ResellerTransaction
                {
                    ResellerId = reseller.Id,
                    Quantity = request.Quantity,
                    PricePerCopy = pricePerCopy,
                    TotalPrice = totalPrice,
                    Remarks = request.Remarks ?? "Bulk purchase by SuperAdmin"
                };

                _context.ResellerTransactions.Add(tx);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Copies added successfully.", NewBalance = reseller.AvailableCopies, PricePerCopy = pricePerCopy, TotalPrice = totalPrice });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("set-promo-code")]
        [Authorize(Roles = "SuperAdmin")]
        public async Task<IActionResult> SetPromoCode([FromBody] SetPromoCodeRequest request)
        {
            var reseller = await _context.Users.FindAsync(request.ResellerId);
            if (reseller == null || reseller.Role != "Reseller") return NotFound("Reseller not found.");

            // Check if code is unique
            if (await _context.Users.AnyAsync(u => u.PromoCode == request.Code && u.Id != request.ResellerId))
                return BadRequest("Promo code already in use.");

            reseller.PromoCode = request.Code;
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Promo code updated." });
        }

        // --- Reseller Actions ---

        [HttpGet("my-panel")]
        [Authorize(Roles = "Reseller")]
        public async Task<IActionResult> GetMyPanel()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return Unauthorized();

            var customers = await _context.Companies
                .Where(c => c.ResellerId == userId)
                .Select(c => new {
                    c.Id,
                    c.Name,
                    c.Email,
                    c.Phone,
                    c.IsActive,
                    c.IsVerified,
                    c.SubscriptionExpiryDate,
                    c.CreateDate
                })
                .OrderByDescending(c => c.CreateDate)
                .ToListAsync();

            var transactions = await _context.ResellerTransactions
                .Where(t => t.ResellerId == userId)
                .OrderByDescending(t => t.CreateDate)
                .ToListAsync();

            return Ok(new {
                PromoCode = user.PromoCode,
                AvailableCopies = user.AvailableCopies,
                Customers = customers,
                Transactions = transactions
            });
        }

        [HttpPost("activate-customer/{companyId}")]
        [Authorize(Roles = "Reseller")]
        public async Task<IActionResult> ActivateCustomer(int companyId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");
            var reseller = await _context.Users.FindAsync(userId);
            if (reseller == null) return Unauthorized();

            if (reseller.AvailableCopies <= 0) return BadRequest("No available copies to activate this customer.");

            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Id == companyId && c.ResellerId == userId);
            if (company == null) return NotFound("Customer not found in your territory.");

            if (company.IsActive) return BadRequest("Customer is already active.");

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                reseller.AvailableCopies--;
                company.IsActive = true;
                company.SubscriptionExpiryDate = DateTime.UtcNow.AddMonths(1); // Default 1 month on activation
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Customer activated successfully.", RemainingCopies = reseller.AvailableCopies });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        public class AddCopiesRequest { public int ResellerId { get; set; } public int Quantity { get; set; } public string? Remarks { get; set; } }
        public class SetPromoCodeRequest { public int ResellerId { get; set; } public string Code { get; set; } = string.Empty; }
    }
}
