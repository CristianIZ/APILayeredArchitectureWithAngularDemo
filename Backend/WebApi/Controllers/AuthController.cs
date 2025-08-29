using Microsoft.AspNetCore.Identity.Data;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace WebApi.Controllers
{
    public class AuthController : Controller
    {
        private readonly IUserService _userService;
        private readonly string _jwtKey = "SuperClaveJWTdeEjemplo1234567890";

        public AuthController(IUserService userService)
        {
            this._userService = userService;
        }

        [HttpPost("/api/Auth/Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Validar que el request no sea nulo y tenga los datos necesarios
            if (request == null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest("Email y contraseña son requeridos");
            }

            var user = await _userService.GetUserByNameAndPassword(request.Email, request.Password);

            if (user == null)
                return Unauthorized("Usuario o contraseña incorrectos");

            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Id.ToString()),
                new Claim("AccountID", user.Name)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: creds
            );

            return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token) });
        }
    }
}
