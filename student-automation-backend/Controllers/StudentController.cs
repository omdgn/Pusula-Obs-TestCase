// Dosya: Controllers/StudentController.cs
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
    public class StudentController : ControllerBase
    {
        private readonly IUserService _userService;

        public StudentController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Teacher")]
        [SwaggerOperation(
            Summary = "Get all students",
            Description = "Retrieves a list of all students. Only accessible by Admin and Teacher roles.",
            OperationId = "GetAllStudents",
            Tags = new[] { "Student" }
        )]
        [SwaggerResponse(200, "Students retrieved successfully")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(403, "Forbidden - Insufficient permissions")]
        public async Task<IActionResult> GetAll()
        {
            var students = await _userService.GetAllStudentsAsync();
            return Ok(students);
        }

        [HttpGet("me")]
        [Authorize(Roles = "Student")]
        [SwaggerOperation(
            Summary = "Get own profile",
            Description = "Allows a student to retrieve their own profile information.",
            OperationId = "GetOwnStudentProfile",
            Tags = new[] { "Student" }
        )]
        [SwaggerResponse(200, "Profile retrieved successfully")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(404, "Student profile not found")]
        public async Task<IActionResult> GetOwnProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var student = await _userService.GetStudentByUserIdAsync(Guid.Parse(userId));
            if (student == null)
                return NotFound(new { Message = "Kayıtlı öğrenci bulunamadı." });

            return Ok(student);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        [SwaggerOperation(
            Summary = "Get student by ID",
            Description = "Retrieves a specific student by their unique identifier. Only accessible by Admin and Teacher roles.",
            OperationId = "GetStudentById",
            Tags = new[] { "Student" }
        )]
        [SwaggerResponse(200, "Student retrieved successfully")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(403, "Forbidden - Insufficient permissions")]
        [SwaggerResponse(404, "Student not found")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var student = await _userService.GetStudentByIdAsync(id);
            if (student == null)
                return NotFound(new { Message = "Öğrenci bulunamadı." });

            return Ok(student);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        [SwaggerOperation(
            Summary = "Update student",
            Description = "Updates a student's information. Only accessible by Admin and Teacher roles.",
            OperationId = "UpdateStudent",
            Tags = new[] { "Student" }
        )]
        [SwaggerResponse(200, "Student updated successfully")]
        [SwaggerResponse(400, "Validation error or student not found")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(403, "Forbidden - Insufficient permissions")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateStudentDto dto)
        {
            try
            {
                var updated = await _userService.UpdateStudentAsync(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(
            Summary = "Delete student",
            Description = "Permanently deletes a student account. Only accessible by Admin role.",
            OperationId = "DeleteStudent",
            Tags = new[] { "Student" }
        )]
        [SwaggerResponse(204, "Student deleted successfully")]
        [SwaggerResponse(400, "Error deleting student")]
        [SwaggerResponse(401, "Unauthorized - Invalid or missing JWT token")]
        [SwaggerResponse(403, "Forbidden - Insufficient permissions")]
        public async Task<IActionResult> Delete(Guid id)
        {
            try
            {
                await _userService.DeleteStudentAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}