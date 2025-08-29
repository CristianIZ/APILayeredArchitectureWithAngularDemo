using Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EFRepository.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetUserByNameAndPassword(string username, string password);
    }
}
