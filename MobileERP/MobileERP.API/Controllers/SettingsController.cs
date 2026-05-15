using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.Services;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IDocumentSequenceService _sequenceService;

        public SettingsController(ApplicationDbContext context, IDocumentSequenceService sequenceService)
        {
            _context = context;
            _sequenceService = sequenceService;
        }

        [HttpGet("sequences")]
        public async Task<IActionResult> GetSequences()
        {
            var comId = _context.CurrentComId ?? 1;
            
            // Ensure initialized
            await _sequenceService.InitializeSequencesForCompanyAsync(comId);

            var sequences = await _context.DocumentSequences
                .Where(s => s.ComId == comId)
                .OrderBy(s => s.DocumentType)
                .ToListAsync();

            return Ok(sequences);
        }

        [HttpPut("sequences/{id}")]
        public async Task<IActionResult> UpdateSequence(int id, [FromBody] DocumentSequence request)
        {
            var comId = _context.CurrentComId ?? 1;
            var sequence = await _context.DocumentSequences.FirstOrDefaultAsync(s => s.Id == id && s.ComId == comId);
            
            if (sequence == null) return NotFound();

            sequence.Prefix = request.Prefix;
            sequence.NextNumber = request.NextNumber;
            
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Sequence updated successfully." });
        }
    }
}
