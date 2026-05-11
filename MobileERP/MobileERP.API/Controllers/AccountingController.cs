using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Linq;
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

        [HttpGet("vouchers")]
        public async Task<IActionResult> GetVouchers(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<JournalVoucher> query = _context.JournalVouchers
                .Include(v => v.Entries)
                    .ThenInclude(e => e.AccountHead);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(v => v.VoucherNo.ToLower().Contains(search) || v.ReferenceNo.ToLower().Contains(search));
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(v => v.VoucherDate)
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

        [HttpPost("expense")]
        public async Task<IActionResult> CreateExpense(ExpenseRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (string.IsNullOrWhiteSpace(request.VoucherNo))
                {
                    request.VoucherNo = "EXP-" + DateTime.UtcNow.ToString("yyyyMMdd") + "-" + (await _context.ExpenseVouchers.CountAsync() + 1).ToString("D4");
                }
                else if (await _context.ExpenseVouchers.AnyAsync(v => v.VoucherNo == request.VoucherNo && v.ComId == 1))
                {
                    return BadRequest("Duplicate Expense Voucher Number.");
                }

                var voucher = new ExpenseVoucher
                {
                    VoucherNo = request.VoucherNo,
                    ExpenseDate = request.ExpenseDate.ToUniversalTime(),
                    PaymentAccountId = request.PaymentAccountId,
                    TotalAmount = request.Details.Sum(d => d.Amount),
                    Remarks = request.Remarks,
                    ComId = 1
                };

                foreach (var detail in request.Details)
                {
                    voucher.Details.Add(new ExpenseDetail
                    {
                        ExpenseAccountId = detail.ExpenseAccountId,
                        Amount = detail.Amount,
                        Note = detail.Note,
                        ComId = 1
                    });
                }

                _context.ExpenseVouchers.Add(voucher);
                await _context.SaveChangesAsync();

                // Create Accounting Journal Voucher
                var jv = new JournalVoucher
                {
                    VoucherNo = "JV-" + voucher.VoucherNo,
                    VoucherDate = request.ExpenseDate.ToUniversalTime(),
                    ReferenceType = "Expense",
                    ReferenceNo = voucher.VoucherNo,
                    Remarks = request.Remarks,
                    ComId = 1
                };

                // Credit the payment account (Cash/Bank)
                jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = 0, Credit = voucher.TotalAmount, ComId = 1 });

                // Debit each expense account
                foreach (var detail in request.Details)
                {
                    jv.Entries.Add(new JournalEntry { AccountHeadId = detail.ExpenseAccountId, Debit = detail.Amount, Credit = 0, ComId = 1 });
                }

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

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories() => Ok(await _context.AccountCategories.ToListAsync());

        [HttpGet("expenses")]
        public async Task<IActionResult> GetExpenses(int page = 1, int pageSize = 10, string? search = null)
        {
            IQueryable<ExpenseVoucher> query = _context.ExpenseVouchers.Include(e => e.Details);

            if (!string.IsNullOrEmpty(search))
            {
                search = search.ToLower();
                query = query.Where(v => v.VoucherNo.ToLower().Contains(search) || (v.Remarks != null && v.Remarks.ToLower().Contains(search)));
            }

            int totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(v => v.ExpenseDate)
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

        [HttpGet("expense/{id}")]
        public async Task<IActionResult> GetExpense(int id)
        {
            var expense = await _context.ExpenseVouchers
                .Include(v => v.Details)
                .FirstOrDefaultAsync(v => v.Id == id);
            
            if (expense == null) return NotFound("Expense not found");
            return Ok(expense);
        }

        [HttpPut("expense/{id}")]
        public async Task<IActionResult> UpdateExpense(int id, ExpenseRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var expense = await _context.ExpenseVouchers
                    .Include(v => v.Details)
                    .FirstOrDefaultAsync(v => v.Id == id);

                if (expense == null) return NotFound("Expense not found");

                expense.ExpenseDate = request.ExpenseDate.ToUniversalTime();
                expense.PaymentAccountId = request.PaymentAccountId;
                expense.Remarks = request.Remarks;
                expense.TotalAmount = request.Details.Sum(d => d.Amount);

                _context.ExpenseDetails.RemoveRange(expense.Details);
                foreach (var detail in request.Details)
                {
                    expense.Details.Add(new ExpenseDetail
                    {
                        ExpenseAccountId = detail.ExpenseAccountId,
                        Amount = detail.Amount,
                        Note = detail.Note,
                        ComId = 1
                    });
                }

                var jv = await _context.JournalVouchers
                    .Include(v => v.Entries)
                    .FirstOrDefaultAsync(v => v.ReferenceNo == expense.VoucherNo && v.ReferenceType == "Expense");

                if (jv != null)
                {
                    _context.JournalEntries.RemoveRange(jv.Entries);
                    jv.VoucherDate = request.ExpenseDate.ToUniversalTime();
                    jv.Remarks = request.Remarks;
                    jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = 0, Credit = expense.TotalAmount, ComId = 1 });
                    foreach (var detail in request.Details)
                    {
                        jv.Entries.Add(new JournalEntry { AccountHeadId = detail.ExpenseAccountId, Debit = detail.Amount, Credit = 0, ComId = 1 });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Expense updated successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
        [HttpDelete("expense/{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var expense = await _context.ExpenseVouchers
                    .Include(v => v.Details)
                    .FirstOrDefaultAsync(v => v.Id == id);

                if (expense == null) return NotFound("Expense not found");

                // Mark expense and details as deleted
                expense.IsDelete = true;
                foreach (var detail in expense.Details)
                {
                    detail.IsDelete = true;
                }

                // Find corresponding JV and mark as deleted
                var jv = await _context.JournalVouchers
                    .Include(v => v.Entries)
                    .FirstOrDefaultAsync(v => v.ReferenceNo == expense.VoucherNo && v.ReferenceType == "Expense");

                if (jv != null)
                {
                    jv.IsDelete = true;
                    foreach (var entry in jv.Entries)
                    {
                        entry.IsDelete = true;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Expense deleted and journal reversed." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
    }
}
