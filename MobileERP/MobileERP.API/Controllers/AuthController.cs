using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System.Threading.Tasks;
using BCrypt.Net;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Username || u.Username == request.Username);

            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            if (!user.IsActive)
            {
                return BadRequest(new { Message = "Account is deactivated" });
            }

            return Ok(new LoginResponse
            {
                Token = "dummy-jwt-token-" + Guid.NewGuid().ToString(),
                FullName = user.FullName,
                Role = user.Role,
                ComId = user.ComId ?? 0,
                IsShowCosting = user.IsShowCosting,
                CanSeeOthersEntry = user.CanSeeOthersEntry
            });
        }
    }
}
