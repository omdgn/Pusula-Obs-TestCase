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
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;

        public AttendanceController(IAttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        // POST /api/attendance/record - Teacher records attendance
        [HttpPost("record")]
        [Authorize(Roles = "Teacher")]
        [SwaggerOperation(Summary = "Record student attendance", Tags = new[] { "Attendance" })]
        [SwaggerResponse(200, "Attendance recorded successfully")]
        [SwaggerResponse(400, "Validation error")]
        public async Task<IActionResult> RecordAttendance([FromBody] RecordAttendanceDto dto)
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
                var attendance = await _attendanceService.RecordAttendanceAsync(dto, Guid.Parse(teacherId));
                return Ok(attendance);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // PUT /api/attendance/{id} - Teacher updates attendance
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateAttendance(Guid id, [FromBody] UpdateAttendanceDto dto)
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
                var attendance = await _attendanceService.UpdateAttendanceAsync(id, dto, Guid.Parse(teacherId));
                return Ok(attendance);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE /api/attendance/{id} - Teacher deletes attendance record
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteAttendance(Guid id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                await _attendanceService.DeleteAttendanceAsync(id, Guid.Parse(teacherId));
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/attendance/my - Student views their attendance
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        [SwaggerOperation(Summary = "Get student's own attendance records", Tags = new[] { "Attendance" })]
        [SwaggerResponse(200, "Attendance records retrieved successfully")]
        public async Task<IActionResult> GetMyAttendance()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null)
                return Unauthorized();

            try
            {
                var attendances = await _attendanceService.GetAttendancesByStudentIdAsync(Guid.Parse(studentId));
                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/attendance/student/{studentId} - Teacher or Admin views specific student attendance
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetStudentAttendance(Guid studentId)
        {
            try
            {
                var attendances = await _attendanceService.GetAttendancesByStudentIdAsync(studentId);
                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/attendance/course/{courseId} - Teacher views attendance for their course
        [HttpGet("course/{courseId}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetCourseAttendance(Guid courseId)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                var attendances = await _attendanceService.GetAttendancesByCourseIdAsync(courseId, Guid.Parse(teacherId));
                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/attendance/date/{date} - Teacher views attendance for specific date
        [HttpGet("date/{date}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetAttendanceByDate(DateTime date)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                var attendances = await _attendanceService.GetAttendancesByDateAsync(date, Guid.Parse(teacherId));
                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/attendance/student/{studentId}/course/{courseId} - Get attendance for specific student and course
        [HttpGet("student/{studentId}/course/{courseId}")]
        [Authorize(Roles = "Teacher,Admin,Student")]
        public async Task<IActionResult> GetAttendanceByStudentAndCourse(Guid studentId, Guid courseId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserId == null)
                return Unauthorized();

            // Students can only view their own attendance
            if (currentUserRole == "Student" && currentUserId != studentId.ToString())
                return Forbid();

            try
            {
                var attendances = await _attendanceService.GetAttendancesByStudentAndCourseAsync(studentId, courseId);
                return Ok(attendances);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/attendance/{id} - Get specific attendance record
        [HttpGet("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetAttendanceById(Guid id)
        {
            try
            {
                var attendance = await _attendanceService.GetAttendanceByIdAsync(id);
                if (attendance == null)
                    return NotFound(new { Message = "Devamsızlık kaydı bulunamadı." });

                return Ok(attendance);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}