using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Infrastructure.Services;
using MobileERP.Application.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Email Service Configuration
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Authentication Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "MobileERP",
        ValidAudience = "MobileERP",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? "ThisIsAHighlySecureAndVeryLongSecretKeyUsedForJWTGenerationInTheMobileERPSystem2026!@#"))
    };
})
.AddGoogle(options =>
{
    options.ClientId = builder.Configuration["GoogleAuth:ClientId"]!;
    options.ClientSecret = builder.Configuration["GoogleAuth:ClientSecret"]!;
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IDocumentSequenceService, DocumentSequenceService>();
builder.Services.AddScoped<DataSeeder>();
builder.Services.AddScoped(typeof(MobileERP.Infrastructure.Repositories.IRepository<>), typeof(MobileERP.Infrastructure.Repositories.GenericRepository<>));

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    
    await seeder.FixSchemaDriftAsync();
    
    var csvPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())!.FullName, "Data", "MobileMasterData_MegaBatch.csv");
    await seeder.SeedMobileDevicesAsync(csvPath);
    await seeder.SeedAccountHeadsAsync();
    await seeder.SeedAdminUserAsync();
    await seeder.SeedCompanyAsync();
    await seeder.SeedMasterDataAsync();
    await seeder.SeedContactsAsync();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Mobile ERP API v1");
        c.RoutePrefix = "swagger"; // Set Swagger at the root or /swagger
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers(); // REQUIRED FOR CONTROLLERS TO WORK

app.Run();
