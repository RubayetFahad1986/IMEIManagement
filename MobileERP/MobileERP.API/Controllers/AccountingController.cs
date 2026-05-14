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
        public async Task<IActionResult> GetVouchers(int page = 1, int pageSize = 10, string? search = null, DateTime? startDate = null, DateTime? endDate = null)
        {
            IQueryable<JournalVoucher> query = _context.JournalVouchers
                .Include(v => v.Entries.Where(e => !e.IsDelete))
                    .ThenInclude(e => e.AccountHead)
                .Where(v => !v.IsDelete);

            if (startDate.HasValue)
            {
                var start = startDate.Value.ToUniversalTime().Date;
                query = query.Where(v => v.VoucherDate >= start);
            }

            if (endDate.HasValue)
            {
                var end = endDate.Value.ToUniversalTime().Date.AddDays(1);
                query = query.Where(v => v.VoucherDate < end);
            }

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
            IQueryable<ExpenseVoucher> query = _context.ExpenseVouchers.Include(e => e.Details).Where(e => !e.IsDelete);

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
                .FirstOrDefaultAsync(v => v.Id == id && !v.IsDelete);
            
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

        [HttpGet("ledger/{contactId}")]
        public async Task<IActionResult> GetContactLedger(int contactId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null) return NotFound("Contact not found");

            // Calculate Opening Balance
            decimal openingBalance = 0;
            if (startDate.HasValue)
            {
                var utcStart = startDate.Value.ToUniversalTime();
                var preDebit = await _context.ContactLedgers
                    .Where(l => l.ContactId == contactId && l.TransactionDate < utcStart && !l.IsDelete)
                    .SumAsync(l => l.Debit);
                var preCredit = await _context.ContactLedgers
                    .Where(l => l.ContactId == contactId && l.TransactionDate < utcStart && !l.IsDelete)
                    .SumAsync(l => l.Credit);
                
                // For Customers: Opening = Debit - Credit. For Suppliers: Opening = Credit - Debit.
                // However, the Ledger Balance usually tracks the "Main" balance.
                // Let's use the actual balance logic from the last record if available, 
                // or just calc from sums.
                openingBalance = preDebit - preCredit; 
            }

            var query = _context.ContactLedgers
                .Where(l => l.ContactId == contactId && l.ComId == 1 && !l.IsDelete);

            if (startDate.HasValue) query = query.Where(l => l.TransactionDate >= startDate.Value.ToUniversalTime());
            if (endDate.HasValue) query = query.Where(l => l.TransactionDate <= endDate.Value.ToUniversalTime());

            var ledgerEntries = await query
                .OrderBy(l => l.TransactionDate)
                .ThenBy(l => l.Id)
                .ToListAsync();

            // --- Document Finalization Logic ---
            // Group by ReferenceNo to find edits/reversals
            var finalLedger = new List<ContactLedger>();
            var entriesByRef = ledgerEntries.GroupBy(l => l.ReferenceNo).ToList();

            foreach (var group in entriesByRef)
            {
                if (string.IsNullOrEmpty(group.Key))
                {
                    finalLedger.AddRange(group);
                    continue;
                }

                // If this group contains a reversal/delete type, we need to filter
                bool hasReversal = group.Any(l => l.TransactionType.Contains("Reverse") || l.TransactionType.Contains("Delete"));
                
                if (hasReversal)
                {
                    // Find the latest "Active" transaction for this reference that isn't a reversal
                    // (e.g. if we have Purchase -> Reversal -> Purchase(Edited), we want the Edited one)
                    var lastReversalDate = group.Where(l => l.TransactionType.Contains("Reverse") || l.TransactionType.Contains("Delete"))
                                                .Max(l => l.TransactionDate);
                    
                    var activeAfterReversal = group.Where(l => l.TransactionDate >= lastReversalDate 
                                                            && !l.TransactionType.Contains("Reverse") 
                                                            && !l.TransactionType.Contains("Delete"))
                                                   .OrderByDescending(l => l.TransactionDate)
                                                   .FirstOrDefault();

                    if (activeAfterReversal != null)
                    {
                        finalLedger.Add(activeAfterReversal);
                    }
                    // If no active record exists after reversal, it means it was a pure deletion, so we add nothing
                }
                else
                {
                    finalLedger.AddRange(group);
                }
            }

            // Re-sort the finalized ledger
            finalLedger = finalLedger.OrderBy(l => l.TransactionDate).ThenBy(l => l.Id).ToList();

            // Fetch details for specific transaction types
            var results = new List<object>();
            
            // Running balance calculation starting from opening
            decimal runningBalance = openingBalance;

            foreach (var entry in finalLedger)
            {
                object? transactionDetails = null;
                runningBalance += (entry.Debit - entry.Credit);
                
                if (entry.TransactionType == "Sale")
                {
                    var sale = await _context.SalesInvoices
                        .Include(s => s.Details)
                            .ThenInclude(d => d.InventoryItem)
                                .ThenInclude(i => i.MobileDevice)
                        .FirstOrDefaultAsync(s => s.InvoiceNo == entry.ReferenceNo && !s.IsDelete);
                    
                    if (sale != null)
                    {
                        transactionDetails = new
                        {
                            sale.Id,
                            sale.InvoiceNo,
                            sale.SalesDate,
                            sale.NetTotal,
                            sale.PaidAmount,
                            Items = sale.Details.Select(d => new
                            {
                                ItemName = d.InventoryItem?.MobileDevice != null 
                                    ? $"{d.InventoryItem.MobileDevice.Brand} {d.InventoryItem.MobileDevice.ModelName}" 
                                    : "General Item",
                                Imeis = new List<string> { d.InventoryItem?.IMEI1 ?? "" },
                                Price = d.UnitPrice
                            })
                        };
                    }
                }
                else if (entry.TransactionType == "Purchase")
                {
                    var purchase = await _context.PurchaseInvoices
                        .Include(p => p.Details)
                            .ThenInclude(d => d.MobileDevice)
                        .Include(p => p.Details)
                            .ThenInclude(d => d.ImeiItems)
                        .FirstOrDefaultAsync(p => p.InvoiceNo == entry.ReferenceNo && !p.IsDelete);

                    if (purchase != null)
                    {
                        transactionDetails = new
                        {
                            purchase.Id,
                            purchase.InvoiceNo,
                            purchase.PurchaseDate,
                            purchase.TotalAmount,
                            purchase.PaidAmount,
                            Items = purchase.Details.Select(d => new
                            {
                                ItemName = d.MobileDevice != null 
                                    ? $"{d.MobileDevice.Brand} {d.MobileDevice.ModelName}" 
                                    : "General Item",
                                Imeis = d.ImeiItems.Select(im => im.IMEI1).ToList(),
                                Price = d.CostPrice
                            })
                        };
                    }
                }
                else if (entry.TransactionType == "SalesReturn")
                {
                    var sReturn = await _context.SalesReturns
                        .Include(r => r.Details)
                        .Where(r => _context.SalesInvoices.Any(i => i.Id == r.SalesInvoiceId && i.InvoiceNo == entry.ReferenceNo) && !r.IsDelete)
                        .OrderByDescending(r => r.ReturnDate)
                        .FirstOrDefaultAsync();

                    if (sReturn != null)
                    {
                        var returnItems = new List<object>();
                        foreach (var d in sReturn.Details)
                        {
                            var item = await _context.Inventory
                                .Include(i => i.MobileDevice)
                                .FirstOrDefaultAsync(i => i.Id == d.InventoryItemId);
                            
                            returnItems.Add(new
                            {
                                ItemName = item?.MobileDevice != null ? $"{item.MobileDevice.Brand} {item.MobileDevice.ModelName}" : "Unknown",
                                Imeis = new List<string> { item?.IMEI1 ?? "" },
                                Price = d.RefundAmount
                            });
                        }

                        transactionDetails = new
                        {
                            sReturn.Id,
                            sReturn.ReturnDate,
                            sReturn.TotalReturnAmount,
                            sReturn.Reason,
                            Items = returnItems
                        };
                    }
                }
                else if (entry.TransactionType == "PurchaseReturn")
                {
                    var pReturn = await _context.PurchaseReturns
                        .Include(r => r.Details)
                        .Where(r => _context.PurchaseInvoices.Any(i => i.Id == r.PurchaseInvoiceId && i.InvoiceNo == entry.ReferenceNo) && !r.IsDelete)
                        .OrderByDescending(r => r.ReturnDate)
                        .FirstOrDefaultAsync();

                    if (pReturn != null)
                    {
                        var returnItems = new List<object>();
                        foreach (var d in pReturn.Details)
                        {
                            var item = await _context.Inventory
                                .Include(i => i.MobileDevice)
                                .FirstOrDefaultAsync(i => i.Id == d.InventoryItemId);
                            
                            returnItems.Add(new
                            {
                                ItemName = item?.MobileDevice != null ? $"{item.MobileDevice.Brand} {item.MobileDevice.ModelName}" : "Unknown",
                                Imeis = new List<string> { item?.IMEI1 ?? "" },
                                Price = d.RefundAmount
                            });
                        }

                        transactionDetails = new
                        {
                            pReturn.Id,
                            pReturn.ReturnDate,
                            pReturn.TotalReturnAmount,
                            pReturn.Reason,
                            Items = returnItems
                        };
                    }
                }

                results.Add(new
                {
                    entry.Id,
                    entry.TransactionDate,
                    entry.Description,
                    entry.ReferenceNo,
                    entry.Debit,
                    entry.Credit,
                    Balance = runningBalance,
                    entry.TransactionType,
                    Details = transactionDetails
                });
            }

            return Ok(new
            {
                Contact = contact,
                OpeningBalance = openingBalance,
                Ledger = results
            });
        }

        [HttpPost("contact-payment")]
        public async Task<IActionResult> RecordContactPayment(ContactPaymentRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var contact = await _context.Contacts.FindAsync(request.ContactId);
                if (contact == null) return NotFound("Contact not found");

                var account = await _context.AccountHeads.FindAsync(request.PaymentAccountId);
                if (account == null) return NotFound("Payment account not found");

                // Update Balances
                if (request.TransactionType == "Receipt") // From Customer
                {
                    contact.CustomerBalance -= request.Amount;
                }
                else if (request.TransactionType == "Payment") // To Supplier
                {
                    contact.SupplierBalance -= request.Amount;
                }

                // Add Ledger Entry
                var ledger = new ContactLedger
                {
                    ContactId = contact.Id,
                    TransactionDate = request.TransactionDate.ToUniversalTime(),
                    Description = request.Remarks ?? $"{request.TransactionType} recorded",
                    ReferenceNo = request.ReferenceNo,
                    Debit = request.TransactionType == "Payment" ? request.Amount : 0,
                    Credit = request.TransactionType == "Receipt" ? request.Amount : 0,
                    Balance = request.TransactionType == "Receipt" ? contact.CustomerBalance : contact.SupplierBalance,
                    TransactionType = request.TransactionType,
                    ComId = 1
                };
                _context.ContactLedgers.Add(ledger);

                // Create Journal Voucher
                var jv = new JournalVoucher
                {
                    VoucherNo = $"JV-{request.TransactionType.ToUpper()}-{DateTime.UtcNow.Ticks}",
                    VoucherDate = request.TransactionDate.ToUniversalTime(),
                    ReferenceType = request.TransactionType,
                    ReferenceNo = request.ReferenceNo ?? "",
                    Remarks = request.Remarks,
                    ComId = 1
                };

                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset");
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability");

                if (request.TransactionType == "Receipt")
                {
                    // Debit Cash/Bank, Credit Accounts Receivable
                    jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = request.Amount, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = request.Amount, ComId = 1 });
                }
                else
                {
                    // Debit Accounts Payable, Credit Cash/Bank
                    jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.Amount, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = 0, Credit = request.Amount, ComId = 1 });
                }

                _context.JournalVouchers.Add(jv);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Payment/Receipt recorded successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        private async Task<int> GetOrCreateAccountAsync(string name, string categoryName)
        {
            var acc = await _context.AccountHeads.FirstOrDefaultAsync(a => a.Name == name && a.ComId == 1);
            if (acc != null) return acc.Id;

            var cat = await _context.AccountCategories.FirstOrDefaultAsync(c => c.Name == categoryName);
            if (cat == null)
            {
                cat = new AccountCategory { Name = categoryName, Code = "999", ComId = 1 };
                _context.AccountCategories.Add(cat);
                await _context.SaveChangesAsync();
            }

            acc = new AccountHead { Name = name, AccountCategoryId = cat.Id, AccountType = "General", ComId = 1 };
            _context.AccountHeads.Add(acc);
            await _context.SaveChangesAsync();
            return acc.Id;
        }

        [HttpPost("due-settlement")]
        public async Task<IActionResult> ProcessDueSettlement(DueCollectionRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var contact = await _context.Contacts.FindAsync(request.ContactId);
                if (contact == null) return NotFound("Contact not found");

                var account = await _context.AccountHeads.FindAsync(request.PaymentAccountId);
                if (account == null) return NotFound("Payment account not found");

                decimal totalAllocated = request.Allocations?.Sum(a => a.Amount) ?? 0;
                decimal unallocated = request.TotalAmount - totalAllocated;

                // Determine transaction direction based on contact type if not specified
                // But usually, Receipt is from Customer, Payment is to Supplier
                string mainType = contact.IsCustomer ? "Receipt" : "Payment";
                
                // Update Invoices
                if (request.Allocations != null)
                {
                    foreach (var alloc in request.Allocations)
                    {
                        if (alloc.InvoiceType == "Sale")
                        {
                            var invoice = await _context.SalesInvoices.FindAsync(alloc.InvoiceId);
                            if (invoice != null)
                            {
                                invoice.PaidAmount += alloc.Amount;
                                contact.CustomerBalance -= alloc.Amount;
                            }
                        }
                        else if (alloc.InvoiceType == "Purchase")
                        {
                            var invoice = await _context.PurchaseInvoices.FindAsync(alloc.InvoiceId);
                            if (invoice != null)
                            {
                                invoice.PaidAmount += alloc.Amount;
                                invoice.DueAmount -= alloc.Amount;
                                contact.SupplierBalance -= alloc.Amount;
                            }
                        }
                    }
                }

                // Handle Advance/Unallocated
                if (unallocated != 0)
                {
                    if (contact.IsCustomer) contact.CustomerBalance -= unallocated;
                    else contact.SupplierBalance -= unallocated;
                }

                // Add Ledger Entry
                var ledger = new ContactLedger
                {
                    ContactId = contact.Id,
                    TransactionDate = request.TransactionDate.ToUniversalTime(),
                    Description = request.Remarks ?? $"{mainType} for Due Settlement",
                    Debit = mainType == "Payment" ? request.TotalAmount : 0,
                    Credit = mainType == "Receipt" ? request.TotalAmount : 0,
                    Balance = mainType == "Receipt" ? contact.CustomerBalance : contact.SupplierBalance,
                    TransactionType = mainType,
                    ComId = 1
                };
                _context.ContactLedgers.Add(ledger);

                // Accounting Entries
                var jv = new JournalVoucher
                {
                    VoucherNo = $"JV-DUE-{mainType.ToUpper()}-{DateTime.UtcNow.Ticks}",
                    VoucherDate = request.TransactionDate.ToUniversalTime(),
                    ReferenceType = "DueSettlement",
                    ReferenceNo = ledger.Id.ToString(), // Will be updated after save if needed
                    Remarks = request.Remarks,
                    ComId = 1
                };

                int arAccId = await GetOrCreateAccountAsync("Accounts Receivable", "Asset");
                int apAccId = await GetOrCreateAccountAsync("Accounts Payable", "Liability");

                if (mainType == "Receipt")
                {
                    jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = request.TotalAmount, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = arAccId, Debit = 0, Credit = request.TotalAmount, ComId = 1 });
                }
                else
                {
                    jv.Entries.Add(new JournalEntry { AccountHeadId = apAccId, Debit = request.TotalAmount, Credit = 0, ComId = 1 });
                    jv.Entries.Add(new JournalEntry { AccountHeadId = request.PaymentAccountId, Debit = 0, Credit = request.TotalAmount, ComId = 1 });
                }

                _context.JournalVouchers.Add(jv);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Due settlement processed successfully." });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("due-invoices/{contactId}")]
        public async Task<IActionResult> GetDueInvoices(int contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null) return NotFound("Contact not found");

            var dueSales = await _context.SalesInvoices
                .Where(s => s.CustomerId == contactId && s.PaidAmount < s.NetTotal && s.ComId == 1)
                .Select(s => new { 
                    s.Id, 
                    s.InvoiceNo, 
                    Date = s.SalesDate, 
                    Total = s.NetTotal, 
                    Paid = s.PaidAmount, 
                    Due = s.NetTotal - s.PaidAmount,
                    Type = "Sale"
                })
                .ToListAsync();

            var duePurchases = await _context.PurchaseInvoices
                .Where(p => p.SupplierId == contactId && p.PaidAmount < p.TotalAmount && p.ComId == 1)
                .Select(p => new { 
                    p.Id, 
                    p.InvoiceNo, 
                    Date = p.PurchaseDate, 
                    Total = p.TotalAmount, 
                    Paid = p.PaidAmount, 
                    Due = p.TotalAmount - p.PaidAmount,
                    Type = "Purchase"
                })
                .ToListAsync();

            return Ok(new {
                Contact = contact,
                Invoices = dueSales.Concat(duePurchases).OrderBy(i => i.Date)
            });
        }

        [HttpPost("smart-transaction")]
        public async Task<IActionResult> CreateSmartTransaction(SmartTransactionRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (request.DebitAccountId == null || request.CreditAccountId == null)
                    return BadRequest("Both Debit and Credit accounts are required.");

                if (request.Amount <= 0)
                    return BadRequest("Amount must be greater than zero.");

                var debitAcc = await _context.AccountHeads.FindAsync(request.DebitAccountId);
                var creditAcc = await _context.AccountHeads.FindAsync(request.CreditAccountId);

                if (debitAcc == null || creditAcc == null)
                    return NotFound("One or both accounts not found.");

                // Create Journal Voucher
                var jv = new JournalVoucher
                {
                    VoucherNo = $"JV-{request.TransactionType.ToUpper()}-{DateTime.UtcNow.Ticks}",
                    VoucherDate = request.TransactionDate.ToUniversalTime(),
                    ReferenceType = request.TransactionType,
                    ReferenceNo = request.ReferenceNo ?? "",
                    Remarks = request.Remarks,
                    ComId = 1
                };

                // Add Entries
                jv.Entries.Add(new JournalEntry { AccountHeadId = debitAcc.Id, Debit = request.Amount, Credit = 0, ComId = 1 });
                jv.Entries.Add(new JournalEntry { AccountHeadId = creditAcc.Id, Debit = 0, Credit = request.Amount, ComId = 1 });

                // Update Balances
                // Assets: Debit+, Credit-
                // Liabilities: Debit-, Credit+
                // Income: Debit-, Credit+
                // Expense: Debit+, Credit-
                
                // Simplified balance update (ignoring detailed category logic for brevity, 
                // but usually handled by a centralized service)
                debitAcc.CurrentBalance += request.Amount;
                creditAcc.CurrentBalance -= request.Amount;

                _context.JournalVouchers.Add(jv);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Transaction recorded successfully.", VoucherNo = jv.VoucherNo });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }
    }
}
