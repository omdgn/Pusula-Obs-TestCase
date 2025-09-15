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
    public class TeacherController : ControllerBase
    {
        private readonly IUserService _userService;

        public TeacherController(IUserService userService)
        {
            _userService = userService;
        }

        // POST /api/teacher - Only Admin can create teachers
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(
            Summary = "Create new teacher",
            Description = "Creates a new teacher account. Only accessible by Admin role.",
            OperationId = "CreateTeacher",
            Tags = new[] { "Teacher" }
        )]
        [SwaggerResponse(200, "Teacher created successfully", typeof(TeacherDto))]
        [SwaggerResponse(400, "Validation error or teacher already exists")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(403, "Forbidden - Insufficient permissions")]
        public async Task<IActionResult> Create([FromBody] CreateTeacherDto dto)
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
                var created = await _userService.CreateTeacherAsync(dto);
                return Ok(created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/teacher - Only Admin can view all teachers
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(
            Summary = "Get all teachers",
            Description = "Retrieves a list of all teachers. Only accessible by Admin role.",
            OperationId = "GetAllTeachers",
            Tags = new[] { "Teacher" }
        )]
        [SwaggerResponse(200, "Teachers retrieved successfully")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(403, "Forbidden - Insufficient permissions")]
        public async Task<IActionResult> GetAll()
        {
            var teachers = await _userService.GetAllTeachersAsync();
            return Ok(teachers);
        }

        // GET /api/teacher/me - Teacher can view their own profile
        [HttpGet("me")]
        [Authorize(Roles = "Teacher")]
        [SwaggerOperation(
            Summary = "Get own profile",
            Description = "Allows a teacher to retrieve their own profile information.",
            OperationId = "GetOwnTeacherProfile",
            Tags = new[] { "Teacher" }
        )]
        [SwaggerResponse(200, "Profile retrieved successfully")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(404, "Teacher profile not found")]
        public async Task<IActionResult> GetOwnProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var teacher = await _userService.GetTeacherByUserIdAsync(Guid.Parse(userId));
            if (teacher == null)
                return NotFound(new { Message = "Kayıtlı öğretmen bulunamadı." });

            return Ok(teacher);
        }

        // GET /api/teacher/{id} - Admin and Teacher can view teacher details
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var teacher = await _userService.GetTeacherByIdAsync(id);
            if (teacher == null)
                return NotFound(new { Message = "Öğretmen bulunamadı." });

            return Ok(teacher);
        }

        // PUT /api/teacher/{id} - Only Admin can update teacher
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTeacherDto dto)
        {
            try
            {
                var updated = await _userService.UpdateTeacherAsync(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE /api/teacher/{id} - Only Admin can delete teacher
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _userService.DeleteTeacherAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}