using System;
using System.IO;
using System.Text.Json;

namespace MobileERP.Infrastructure.Persistence
{
    public class DbConfigModel
    {
        public string Provider { get; set; } = string.Empty;
        public string ConnectionString { get; set; } = string.Empty;
        public bool IsConfigured { get; set; }
    }

    public static class DbConfigManager
    {
        private static readonly string ConfigPath = Path.Combine(Directory.GetCurrentDirectory(), "database-config.json");

        public static DbConfigModel GetConfig()
        {
            if (File.Exists(ConfigPath))
            {
                try
                {
                    var json = File.ReadAllText(ConfigPath);
                    return JsonSerializer.Deserialize<DbConfigModel>(json) ?? new DbConfigModel();
                }
                catch
                {
                    return new DbConfigModel();
                }
            }
            return new DbConfigModel();
        }

        public static void SaveConfig(string provider, string connectionString)
        {
            var config = new DbConfigModel
            {
                Provider = provider,
                ConnectionString = connectionString,
                IsConfigured = true
            };
            var json = JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(ConfigPath, json);
        }
    }
}