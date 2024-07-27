using AdminPanelApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AdminPanelApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }

}
