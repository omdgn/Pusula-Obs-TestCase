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
    public class CourseController : ControllerBase
    {
        private readonly ICourseService _courseService;

        public CourseController(ICourseService courseService)
        {
            _courseService = courseService;
        }

        // POST /api/course - Admin creates course
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [SwaggerOperation(Summary = "Create new course", Tags = new[] { "Course" })]
        [SwaggerResponse(200, "Course created successfully")]
        [SwaggerResponse(400, "Validation error")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
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
                var created = await _courseService.CreateCourseAsync(dto);
                return Ok(created);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/course - Admin sees all courses
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCourses()
        {
            var courses = await _courseService.GetAllCoursesAsync();
            return Ok(courses);
        }

        // GET /api/course/my - Teacher sees their courses
        [HttpGet("my")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyCourses()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var courses = await _courseService.GetCoursesByTeacherIdAsync(Guid.Parse(userId));
            return Ok(courses);
        }

        // GET /api/course/{id} - Admin and Teacher can view course details
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,Teacher")]
        public async Task<IActionResult> GetCourseById(Guid id)
        {
            var course = await _courseService.GetCourseByIdAsync(id);
            if (course == null)
                return NotFound(new { Message = "Ders bulunamadı." });

            return Ok(course);
        }

        // PATCH /api/course/{id}/status - Teacher updates course status
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateCourseStatus(Guid id, [FromBody] UpdateCourseStatusDto dto)
        {
            try
            {
                var updated = await _courseService.UpdateCourseStatusAsync(id, dto);
                return Ok(updated);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // POST /api/course/{id}/students/{studentId} - Teacher adds student to course
        [HttpPost("{id}/students/{studentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> AddStudentToCourse(Guid id, Guid studentId)
        {
            try
            {
                await _courseService.AddStudentToCourseAsync(id, studentId);
                return Ok(new { Message = "Öğrenci derse başarıyla eklendi." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE /api/course/{id}/students/{studentId} - Teacher removes student from course
        [HttpDelete("{id}/students/{studentId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> RemoveStudentFromCourse(Guid id, Guid studentId)
        {
            try
            {
                await _courseService.RemoveStudentFromCourseAsync(id, studentId);
                return Ok(new { Message = "Öğrenci dersten başarıyla çıkarıldı." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/course/{id}/students - Teacher views course students
        [HttpGet("{id}/students")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetCourseStudents(Guid id)
        {
            try
            {
                var students = await _courseService.GetCourseStudentsAsync(id);
                return Ok(students);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE /api/course/{id} - Admin deletes course
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCourse(Guid id)
        {
            try
            {
                await _courseService.DeleteCourseAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}