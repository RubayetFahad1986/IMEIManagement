using Microsoft.EntityFrameworkCore;
using MobileERP.Application.Services;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.Infrastructure.Services
{
    public class DocumentSequenceService : IDocumentSequenceService
    {
        private readonly ApplicationDbContext _context;
        private readonly ICurrentUserService _currentUserService;

        public DocumentSequenceService(ApplicationDbContext context, ICurrentUserService currentUserService)
        {
            _context = context;
            _currentUserService = currentUserService;
        }

        public async Task<string> GetNextSequenceAsync(string documentType)
        {
            var comId = _currentUserService.ComId ?? 1;

            // Use a transaction and row-level lock (simplified for now with first-or-create)
            var sequence = await _context.DocumentSequences
                .FirstOrDefaultAsync(s => s.DocumentType == documentType && s.ComId == comId);

            if (sequence == null)
            {
                // Fallback to default if not initialized
                sequence = new DocumentSequence
                {
                    ComId = comId,
                    DocumentType = documentType,
                    Prefix = GetDefaultPrefix(documentType),
                    NextNumber = 10000,
                    CreateDate = DateTime.UtcNow
                };
                _context.DocumentSequences.Add(sequence);
                await _context.SaveChangesAsync();
            }

            var nextNum = sequence.NextNumber;
            sequence.NextNumber++;
            sequence.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return $"{sequence.Prefix}{nextNum}";
        }

        public async Task InitializeSequencesForCompanyAsync(int comId)
        {
            var docTypes = new[] { "Product", "Sale", "Purchase", "SaleReturn", "PurchaseReturn", "Damage", "Issue", "DailyTransaction", "Journal" };
            
            foreach (var type in docTypes)
            {
                if (!await _context.DocumentSequences.AnyAsync(s => s.DocumentType == type && s.ComId == comId))
                {
                    _context.DocumentSequences.Add(new DocumentSequence
                    {
                        ComId = comId,
                        DocumentType = type,
                        Prefix = GetDefaultPrefix(type),
                        NextNumber = 10000,
                        CreateDate = DateTime.UtcNow
                    });
                }
            }
            await _context.SaveChangesAsync();
        }

        private string GetDefaultPrefix(string type) => type switch
        {
            "Product" => "PRD-",
            "Sale" => "SAL-",
            "Purchase" => "PUR-",
            "SaleReturn" => "SR-",
            "PurchaseReturn" => "PR-",
            "Damage" => "DMG-",
            "Issue" => "ISS-",
            "DailyTransaction" => "DTX-",
            "Journal" => "JV-",
            _ => "DOC-"
        };
    }
}
