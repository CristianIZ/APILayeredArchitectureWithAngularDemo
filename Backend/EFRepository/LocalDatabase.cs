using Domain;
using EFRepository.Configurations;
using Microsoft.EntityFrameworkCore;

namespace EFRepository
{
    public class LocalDatabase : DbContext
    {
        public LocalDatabase(DbContextOptions<LocalDatabase> options) : base(options)
        {
        }

        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfiguration(new UserConfiguration());

            base.OnModelCreating(modelBuilder);
        }
    }
}
