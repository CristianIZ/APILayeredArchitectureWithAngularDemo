using Domain;
using EFRepository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EFRepository.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly LocalDatabase _context;

        public UserRepository(LocalDatabase context)
        {
            this._context = context;
        }

        public async Task<User?> GetUserByNameAndPassword(string email, string password)
        {
            return await this._context.Users.Where(u => u.Email == email && u.Password == password).FirstOrDefaultAsync();
        }
    }
}
