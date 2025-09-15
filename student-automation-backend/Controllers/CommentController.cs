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
    public class CommentController : ControllerBase
    {
        private readonly ICommentService _commentService;

        public CommentController(ICommentService commentService)
        {
            _commentService = commentService;
        }

        // POST /api/comment - Teacher adds comment about student
        [HttpPost]
        [Authorize(Roles = "Teacher")]
        [SwaggerOperation(Summary = "Add comment about student", Tags = new[] { "Comment" })]
        [SwaggerResponse(200, "Comment added successfully")]
        [SwaggerResponse(400, "Validation error")]
        public async Task<IActionResult> AddComment([FromBody] AddCommentDto dto)
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
                var comment = await _commentService.AddCommentAsync(dto, Guid.Parse(teacherId));
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // PUT /api/comment/{id} - Teacher updates comment
        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> UpdateComment(Guid id, [FromBody] UpdateCommentDto dto)
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
                var comment = await _commentService.UpdateCommentAsync(id, dto, Guid.Parse(teacherId));
                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // DELETE /api/comment/{id} - Teacher deletes comment
        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> DeleteComment(Guid id)
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                await _commentService.DeleteCommentAsync(id, Guid.Parse(teacherId));
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/comment/student/{studentId} - View comments for a specific student
        [HttpGet("student/{studentId}")]
        [Authorize(Roles = "Teacher,Admin,Student")]
        public async Task<IActionResult> GetCommentsByStudent(Guid studentId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserId == null)
                return Unauthorized();

            // Students can only view their own comments
            if (currentUserRole == "Student" && currentUserId != studentId.ToString())
                return Forbid();

            try
            {
                var comments = await _commentService.GetCommentsByStudentIdAsync(studentId);
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/comment/my - Student views their own comments
        [HttpGet("my")]
        [Authorize(Roles = "Student")]
        [SwaggerOperation(Summary = "Get student's own comments", Tags = new[] { "Comment" })]
        [SwaggerResponse(200, "Comments retrieved successfully")]
        public async Task<IActionResult> GetMyComments()
        {
            var studentId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (studentId == null)
                return Unauthorized();

            try
            {
                var comments = await _commentService.GetCommentsByStudentIdAsync(Guid.Parse(studentId));
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/comment/teacher/my - Teacher views their own comments
        [HttpGet("teacher/my")]
        [Authorize(Roles = "Teacher")]
        public async Task<IActionResult> GetMyTeacherComments()
        {
            var teacherId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (teacherId == null)
                return Unauthorized();

            try
            {
                var comments = await _commentService.GetCommentsByTeacherIdAsync(Guid.Parse(teacherId));
                return Ok(comments);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        // GET /api/comment/{id} - Get specific comment by ID
        [HttpGet("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetCommentById(Guid id)
        {
            try
            {
                var comment = await _commentService.GetCommentByIdAsync(id);
                if (comment == null)
                    return NotFound(new { Message = "Yorum bulunamadı." });

                return Ok(comment);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}