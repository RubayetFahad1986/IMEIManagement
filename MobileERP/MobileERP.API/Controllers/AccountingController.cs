using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AccountingController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories() => Ok(await _context.AccountCategories.ToListAsync());

        [HttpPost("expense")]
        public async Task<IActionResult> CreateExpense(ExpenseRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var voucher = new ExpenseVoucher
                {
                    VoucherNo = "EXP-" + DateTime.UtcNow.Ticks,
                    ExpenseDate = request.ExpenseDate,
                    PaymentAccountId = request.PaymentAccountId,
                    Remarks = request.Remarks,
                    ComId = 1
                };

                decimal total = 0;
                foreach (var detail in request.Details)
                {
                    total += detail.Amount;
                    voucher.Details.Add(new ExpenseDetail
                    {
                        ExpenseAccountId = detail.ExpenseAccountId,
                        Amount = detail.Amount,
                        Note = detail.Note,
                        ComId = 1
                    });
                }
                voucher.TotalAmount = total;
                _context.ExpenseVouchers.Add(voucher);
                await _context.SaveChangesAsync();

                // === Journal Voucher ===
                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-" + voucher.VoucherNo,
                    VoucherDate = request.ExpenseDate,
                    ReferenceType = "Expense",
                    ReferenceNo = voucher.VoucherNo,
                    ComId = 1
                };

                // Debit Expense Accounts
                foreach (var detail in request.Details)
                {
                    jv.Entries.Add(new JournalEntry { AccountHeadId = detail.ExpenseAccountId, Debit = detail.Amount, Credit = 0, ComId = 1 });
                }

                // Credit Payment Account (Cash/Bank)
                jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = 0, Credit = total, ComId = 1 });

                _context.JournalVouchers.Add(jv);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Expense recorded and journalized.", VoucherNo = voucher.VoucherNo });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
    }
}
