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
    public class GradeController : ControllerBase
    {
        private readonly IGradeService _gradeService;

        public GradeController(IGradeService gradeService)
        {
            _gradeService = gradeService;
        }

        // POST /api/grade - Teacher adds grade
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        [SwaggerOperation(Summary = "Add grade for student", Tags = new[] { "Grade" })]
        [SwaggerResponse(200, "Grade added successfully")]
        [SwaggerResponse(400, "Validation error")]
        public async Task<IActionResult> AddGrade([FromBody] AddGradeDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(new { Errors = errors });
            }

            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                var grade = await _gradeService.AddGradeAsync(dto, Guid.Parse(teacherId));
                return Ok(grade);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // PUT /api/grade/{id} - Teacher updates grade
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateGrade(Guid id, [FromBody] UpdateGradeDto dto)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage);
                return BadRequest(new { Errors = errors });
            }

            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                var grade = await _gradeService.UpdateGradeAsync(id, dto, Guid.Parse(teacherId));
                return Ok(grade);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE /api/grade/{id} - Teacher deletes grade
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteGrade(Guid id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                await _gradeService.DeleteGradeAsync(id, Guid.Parse(teacherId));
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/grade/my - Student views their grades
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        [SwaggerOperation(Summary = "Get student's own grades", Tags = new[] { "Grade" })]
        [SwaggerResponse(200, "Grades retrieved successfully")]
        public async Task<IActionResult> GetMyGrades()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null)
                return Unauthorized();

            try
            {
                var grades = await _gradeService.GetGradesByStudentIdAsync(Guid.Parse(studentId));
                return Ok(grades);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/grade/course/{courseId} - Teacher views grades for a course
        [HttpGet("course/{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetGradesByCourse(Guid courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                var grades = await _gradeService.GetGradesByCourseIdAsync(courseId, Guid.Parse(teacherId));
                return Ok(grades);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/grade/{id} - Teacher and Admin can view specific grade
        [HttpGet("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetGradeById(Guid id)
        {
            try
            {
                var grade = await _gradeService.GetGradeByIdAsync(id);
                if (grade == null)
                    return NotFound(new { Message = "Not bulunamadı." });

                return Ok(grade);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}