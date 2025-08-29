using DTO;
using EFRepository.Repository;
using EFRepository.Interfaces;
using Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Domain;
using AutoMapper;

namespace Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IMapper _mapper;

        public UserService(IUserRepository userRepository, IMapper mapper)
        {
            this._userRepository = userRepository;
            this._mapper = mapper;
        }

        public async Task<UserDto> GetUserByNameAndPassword(string email, string password)
        {
            var user = await this._userRepository.GetUserByNameAndPassword(email, password);

            return this._mapper.Map<UserDto>(user);
        }
    }
}
