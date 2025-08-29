using Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;

namespace EFRepository
{
    public class LocalDatabaseFactory : IDesignTimeDbContextFactory<LocalDatabase>
    {
        public LocalDatabase CreateDbContext(string[] args)
        {
            // Obtener la ruta del proyecto WebApi
            var webApiPath = Path.Combine(Directory.GetCurrentDirectory(), "../WebApi");
            var appsettingsPath = Path.Combine(webApiPath, "appsettings.json");
            var appsettingsDevPath = Path.Combine(webApiPath, "appsettings.Development.json");

            // Construir la configuración
            var configurationBuilder = new ConfigurationBuilder();

            if (File.Exists(appsettingsPath))
                configurationBuilder.AddJsonFile(appsettingsPath, optional: false);

            if (File.Exists(appsettingsDevPath))
                configurationBuilder.AddJsonFile(appsettingsDevPath, optional: true);

            var configuration = configurationBuilder.Build();

            // Crear y configurar Settings
            var settings = new Settings();
            configuration.Bind(settings);

            // Configurar DbContext
            var optionsBuilder = new DbContextOptionsBuilder<LocalDatabase>();
            optionsBuilder.UseSqlServer(settings.ConnectionStrings.LocalDatabase);

            return new LocalDatabase(optionsBuilder.Options);
        }
    }
}
