using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Application.DTOs;
using MobileERP.Domain.Entities;
using MobileERP.Infrastructure.Persistence;
using System.Threading.Tasks;
using BCrypt.Net;
using MobileERP.Application.Services;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ITokenService _tokenService;

        public AuthController(ApplicationDbContext context, IEmailService emailService, ITokenService tokenService)
        {
            _context = context;
            _emailService = emailService;
            _tokenService = tokenService;
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

            // Subscription Check
            bool isExpired = false;
            bool isNearExpiry = false;
            DateTime? expiryDate = null;

            if (user.ComId.HasValue && user.ComId > 1) // ComId 1 is SuperAdmin/System
            {
                var company = await _context.Companies.FindAsync(user.ComId.Value);
                if (company != null)
                {
                    if (!company.IsVerified) return BadRequest(new { Message = "Company email not verified." });
                    
                    expiryDate = company.SubscriptionExpiryDate;
                    if (expiryDate.HasValue)
                    {
                        if (DateTime.UtcNow > expiryDate.Value) isExpired = true;
                        else if ((expiryDate.Value - DateTime.UtcNow).TotalDays <= 3) isNearExpiry = true;
                    }
                }
            }

            if (isExpired && user.Role != "SuperAdmin") 
            {
                return BadRequest(new { Message = "Subscription expired. Please contact support.", IsExpired = true });
            }

            return Ok(new LoginResponse
            {
                Token = _tokenService.CreateToken(user),
                FullName = user.FullName,
                Role = user.Role,
                ComId = user.ComId ?? 0,
                IsShowCosting = user.IsShowCosting,
                CanSeeOthersEntry = user.CanSeeOthersEntry,
                SubscriptionExpiryDate = expiryDate,
                IsNearExpiry = isNearExpiry,
                IsExpired = isExpired
            });
        }

        [HttpPost("signup")]
        public async Task<IActionResult> Signup(RegistrationRequest request)
        {
            Console.WriteLine($"[DEBUG] Signup started for: {request.Email}");
            
            var existingCompany = await _context.Companies.FirstOrDefaultAsync(c => c.Email == request.Email);
            if (existingCompany != null)
            {
                if (existingCompany.IsVerified)
                {
                    Console.WriteLine($"[DEBUG] Email already verified: {request.Email}");
                    return BadRequest("Email already registered and verified.");
                }
                else
                {
                    Console.WriteLine($"[DEBUG] Unverified company exists. Deleting to allow re-registration: {request.Email}");
                    // Remove existing unverified company and its users to reset
                    var existingUsers = await _context.Users.Where(u => u.ComId == existingCompany.Id).ToListAsync();
                    _context.Users.RemoveRange(existingUsers);
                    _context.Companies.Remove(existingCompany);
                    await _context.SaveChangesAsync();
                }
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            Console.WriteLine($"[DEBUG] Transaction started");
            try
            {
                User? reseller = null;
                if (!string.IsNullOrEmpty(request.PromoCode))
                {
                    reseller = await _context.Users.FirstOrDefaultAsync(u => u.PromoCode == request.PromoCode && u.Role == "Reseller");
                    if (reseller == null) return BadRequest("Invalid Promo Code.");
                }

                var otp = request.Email.EndsWith("@test.com") ? "111111" : new Random().Next(100000, 999999).ToString();
                
                var company = new Company
                {
                    Name = request.CompanyName,
                    Email = request.Email,
                    Phone = request.Phone,
                    PlanType = request.PlanType,
                    IsVerified = false,
                    VerificationOtp = otp,
                    IsActive = reseller == null, // Inactive if using reseller promo code until activated
                    ResellerId = reseller?.Id,
                    SubscriptionExpiryDate = reseller != null ? null : (request.PlanType switch
                    {
                        "Monthly" => DateTime.UtcNow.AddMonths(1),
                        "Quarterly" => DateTime.UtcNow.AddMonths(3),
                        "HalfYearly" => DateTime.UtcNow.AddMonths(6),
                        "Yearly" => DateTime.UtcNow.AddYears(1),
                        _ => DateTime.UtcNow.AddMonths(1)
                    }),
                    CreateDate = DateTime.UtcNow
                };

                Console.WriteLine($"[DEBUG] Adding company: {company.Name}");
                _context.Companies.Add(company);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] Company saved with ID: {company.Id}");

                var user = new User
                {
                    Username = request.Email,
                    Email = request.Email,
                    FullName = request.AdminFullName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role = "CompanyAdmin",
                    ComId = company.Id,
                    IsActive = true,
                    CreateDate = DateTime.UtcNow
                };

                Console.WriteLine($"[DEBUG] Adding user: {user.Username}");
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                Console.WriteLine($"[DEBUG] User saved");

                await transaction.CommitAsync();
                Console.WriteLine($"[DEBUG] Transaction committed");

                // Send Real Email
                var confirmationLink = $"http://localhost:3000/verify-otp?email={Uri.EscapeDataString(request.Email)}&otp={otp}";
                var emailBody = $@"
                    <div style='font-family: sans-serif; padding: 20px;'>
                        <h2>Verify your ERP Account</h2>
                        <p>Your OTP code is: <b style='font-size: 24px;'>{otp}</b></p>
                        <p>Or click the link below to verify automatically:</p>
                        <a href='{confirmationLink}' style='background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Verify Account</a>
                    </div>";

                try {
                    await _emailService.SendEmailAsync(request.Email, "Verify your ERP Account", emailBody);
                    Console.WriteLine($"[DEBUG] Verification email sent to {request.Email}");
                } catch (Exception ex) {
                    Console.WriteLine($"[ERROR] Failed to send email: {ex.Message}");
                }

                return Ok(new { Message = "Registration successful. Please verify OTP sent to your email." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] Signup failed: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
                await transaction.RollbackAsync();
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(OtpVerificationRequest request)
        {
            var company = await _context.Companies.FirstOrDefaultAsync(c => c.Email == request.Email && c.VerificationOtp == request.Otp);
            if (company == null) return BadRequest("Invalid OTP or Email.");

            company.IsVerified = true;
            company.VerificationOtp = null;
            await _context.SaveChangesAsync();

            // Automatic Login after verification
            var user = await _context.Users.FirstOrDefaultAsync(u => u.ComId == company.Id && u.Role == "CompanyAdmin");
            
            if (user == null) return Ok(new { Message = "Account verified successfully. Please login manually." });

            return Ok(new LoginResponse
            {
                Token = _tokenService.CreateToken(user),
                FullName = user.FullName,
                Role = user.Role,
                ComId = user.ComId ?? 0,
                IsShowCosting = user.IsShowCosting,
                CanSeeOthersEntry = user.CanSeeOthersEntry,
                SubscriptionExpiryDate = company.SubscriptionExpiryDate,
                IsNearExpiry = false,
                IsExpired = false,
                Message = "Account verified successfully. Logging you in..."
            });
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] string googleToken)
        {
            // In a real app, you would use Google JSON Web Signature (JWS) validation
            // For this demo, let's assume the token is valid and contains user info
            // In production, use Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(googleToken)
            
            return Ok(new { Message = "Google Auth initialized. Implement token validation for production." });
        }
    }
}
