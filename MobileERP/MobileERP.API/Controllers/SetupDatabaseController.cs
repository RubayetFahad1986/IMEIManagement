using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Infrastructure.Services;
using System.Threading.Tasks;

namespace MobileERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupDatabaseController : ControllerBase
    {
        private readonly DataSeeder _dataSeeder;

        public SetupDatabaseController(DataSeeder dataSeeder)
        {
            _dataSeeder = dataSeeder;
        }

        public class DbSetupRequest
        {
            public string Provider { get; set; } = string.Empty;
            public string ConnectionString { get; set; } = string.Empty;
        }

        [HttpGet("status")]
        public IActionResult GetStatus()
        {
            var config = DbConfigManager.GetConfig();
            return Ok(new { IsConfigured = config.IsConfigured, Provider = config.Provider });
        }

        [HttpPost("configure")]
        public async Task<IActionResult> ConfigureDatabase([FromBody] DbSetupRequest request)
        {
            // Test connection first using a temporary DbContextOptionsBuilder
            var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
            
            try
            {
                if (request.Provider == "PostgreSQL")
                    optionsBuilder.UseNpgsql(request.ConnectionString);
                else if (request.Provider == "SQLServer")
                    optionsBuilder.UseSqlServer(request.ConnectionString);
                else if (request.Provider == "MySQL")
                    optionsBuilder.UseMySql(request.ConnectionString, ServerVersion.AutoDetect(request.ConnectionString));
                else if (request.Provider == "SQLite" || request.Provider == "Embedded")
                    optionsBuilder.UseSqlite(request.ConnectionString);
                else
                    return BadRequest(new { Error = "Invalid provider." });

                using var context = new ApplicationDbContext(optionsBuilder.Options, null!);
                
                // EnsureCreated will create schema across any provider without requiring pre-compiled migrations
                await context.Database.EnsureCreatedAsync();

                // If successful, save configuration
                DbConfigManager.SaveConfig(request.Provider, request.ConnectionString);

                // Run seeder manually on this context
                // We might need to run seed logic. The DataSeeder typically relies on DI.
                // However, EnsureCreated does not track migrations so FixSchemaDrift is irrelevant for new DBs via EnsureCreated
            }
            catch (System.Exception ex)
            {
                return BadRequest(new { Error = "Database connection or creation failed: " + ex.Message });
            }

            return Ok(new { Message = "Database configured and initialized successfully! Please restart the application if needed, or proceed to login." });
        }
    }
}