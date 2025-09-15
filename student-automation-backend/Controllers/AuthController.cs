using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentAutomation.Models.Dtos;
using StudentAutomation.Services;
using System.Security.Claims;
using Swashbuckle.AspNetCore.Annotations;

namespace StudentAutomation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        // ================== Kayıt ==================
        [HttpPost("register")]
        [SwaggerOperation(
            Summary = "Register new user",
            Description = "Creates a new user account. Only Admin role is supported in current implementation.",
            OperationId = "RegisterUser",
            Tags = new[] { "Authentication" }
        )]
        [SwaggerResponse(200, "User registered successfully", typeof(AuthResponseDto))]
        [SwaggerResponse(400, "Validation error or user already exists")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(new { Errors = errors });
            }

            try
            {
                var response = await _authService.RegisterAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // ================== Giriş ==================
        [HttpPost("login")]
        [SwaggerOperation(
            Summary = "User login",
            Description = "Authenticate user and return JWT token. Supports Admin, Teacher, and Student roles.",
            OperationId = "LoginUser",
            Tags = new[] { "Authentication" }
        )]
        [SwaggerResponse(200, "Login successful", typeof(AuthResponseDto))]
        [SwaggerResponse(401, "Invalid credentials")]
        [SwaggerResponse(400, "Validation error")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(new { Errors = errors });
            }

            try
            {
                var response = await _authService.LoginAsync(dto);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return Unauthorized(new { Message = ex.Message });
            }
        }

        // ================== Profil ==================
        [Authorize]
        [HttpGet("me")]
        [SwaggerOperation(
            Summary = "Get current user profile",
            Description = "Returns the authenticated user's profile information including ID, email, and role.",
            OperationId = "GetUserProfile",
            Tags = new[] { "Authentication" }
        )]
        [SwaggerResponse(200, "Profile retrieved successfully")]
        [SwaggerResponse(401, "User not authenticated")]
        public IActionResult GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var role = User.FindFirstValue(ClaimTypes.Role);

            return Ok(new
            {
                userId,
                email,
                role
            });
        }
    }
}
