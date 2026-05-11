using Microsoft.EntityFrameworkCore;
using MobileERP.Infrastructure.Persistence;
using MobileERP.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

builder.Services.AddScoped<DataSeeder>();
builder.Services.AddScoped(typeof(MobileERP.Infrastructure.Repositories.IRepository<>), typeof(MobileERP.Infrastructure.Repositories.GenericRepository<>));

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();
    var csvPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())!.FullName, "Data", "MobileMasterData_MegaBatch.csv");
    await seeder.SeedMobileDevicesAsync(csvPath);
    await seeder.SeedAccountHeadsAsync();
    await seeder.SeedAdminUserAsync();
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

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapControllers(); // REQUIRED FOR CONTROLLERS TO WORK

app.Run();
