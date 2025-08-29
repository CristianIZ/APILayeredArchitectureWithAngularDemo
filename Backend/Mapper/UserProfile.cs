using AutoMapper;
using Domain;
using DTO;

namespace Mapper
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            // Mapeo de User a UserDto
            CreateMap<User, UserDto>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.SurName, opt => opt.MapFrom(src => src.SurName))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password));

            // Mapeo de UserDto a User
            CreateMap<UserDto, User>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
                .ForMember(dest => dest.SurName, opt => opt.MapFrom(src => src.SurName))
                .ForMember(dest => dest.Password, opt => opt.MapFrom(src => src.Password));
        }
    }
}