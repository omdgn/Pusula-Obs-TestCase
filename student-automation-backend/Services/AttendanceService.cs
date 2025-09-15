using Microsoft.EntityFrameworkCore;
using StudentAutomation.Data;
using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly ApplicationDbContext _context;

        public AttendanceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Attendance> RecordAttendanceAsync(RecordAttendanceDto dto, Guid teacherId)
        {
            // Verify student exists
            var student = await _context.Users.FirstOrDefaultAsync(u => u.Id == dto.StudentId && u.Role == UserRole.Student);
            if (student == null)
                throw new Exception("Öğrenci bulunamadı.");

            // Verify teacher exists
            var teacher = await _context.Users.FirstOrDefaultAsync(u => u.Id == teacherId && u.Role == UserRole.Teacher);
            if (teacher == null)
                throw new Exception("Öğretmen bulunamadı.");

            // Verify course exists and teacher is assigned to it
            var course = await _context.Courses.FirstOrDefaultAsync(c => c.Id == dto.CourseId && c.TeacherId == teacherId);
            if (course == null)
                throw new Exception("Ders bulunamadı veya bu derse erişim yetkiniz yok.");

            // Check if attendance already recorded for this student, course and date
            var existingAttendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.StudentId == dto.StudentId &&
                                         a.CourseId == dto.CourseId &&
                                         a.Date.Date == dto.Date.Date);

            if (existingAttendance != null)
                throw new Exception("Bu öğrenci için bu tarihte zaten devamsızlık kaydı mevcut.");

            var attendance = new Attendance
            {
                StudentId = dto.StudentId,
                CourseId = dto.CourseId,
                TeacherId = teacherId,
                Status = dto.Status,
                Date = dto.Date,
                Notes = dto.Notes
            };

            _context.Attendances.Add(attendance);
            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(attendance)
                .Reference(a => a.Student)
                .LoadAsync();
            await _context.Entry(attendance)
                .Reference(a => a.Course)
                .LoadAsync();
            await _context.Entry(attendance)
                .Reference(a => a.Teacher)
                .LoadAsync();

            return attendance;
        }

        public async Task<Attendance> UpdateAttendanceAsync(Guid attendanceId, UpdateAttendanceDto dto, Guid teacherId)
        {
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.Id == attendanceId && a.TeacherId == teacherId);

            if (attendance == null)
                throw new Exception("Devamsızlık kaydı bulunamadı veya bu kayda erişim yetkiniz yok.");

            attendance.Status = dto.Status;
            attendance.Notes = dto.Notes;
            attendance.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Load navigation properties
            await _context.Entry(attendance)
                .Reference(a => a.Student)
                .LoadAsync();
            await _context.Entry(attendance)
                .Reference(a => a.Course)
                .LoadAsync();
            await _context.Entry(attendance)
                .Reference(a => a.Teacher)
                .LoadAsync();

            return attendance;
        }

        public async Task DeleteAttendanceAsync(Guid attendanceId, Guid teacherId)
        {
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.Id == attendanceId && a.TeacherId == teacherId);

            if (attendance == null)
                throw new Exception("Devamsızlık kaydı bulunamadı veya bu kayda erişim yetkiniz yok.");

            _context.Attendances.Remove(attendance);
            await _context.SaveChangesAsync();
        }

        public async Task<List<Attendance>> GetAttendancesByStudentIdAsync(Guid studentId)
        {
            return await _context.Attendances
                .Include(a => a.Course)
                .Include(a => a.Teacher)
                .Where(a => a.StudentId == studentId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetAttendancesByCourseIdAsync(Guid courseId, Guid teacherId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Course)
                .Where(a => a.CourseId == courseId && a.TeacherId == teacherId)
                .OrderByDescending(a => a.Date)
                .ThenBy(a => a.Student.FullName)
                .ToListAsync();
        }

        public async Task<List<Attendance>> GetAttendancesByDateAsync(DateTime date, Guid teacherId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Course)
                .Where(a => a.Date.Date == date.Date && a.TeacherId == teacherId)
                .OrderBy(a => a.Course.Title)
                .ThenBy(a => a.Student.FullName)
                .ToListAsync();
        }

        public async Task<Attendance?> GetAttendanceByIdAsync(Guid attendanceId)
        {
            return await _context.Attendances
                .Include(a => a.Student)
                .Include(a => a.Course)
                .Include(a => a.Teacher)
                .FirstOrDefaultAsync(a => a.Id == attendanceId);
        }

        public async Task<List<Attendance>> GetAttendancesByStudentAndCourseAsync(Guid studentId, Guid courseId)
        {
            return await _context.Attendances
                .Include(a => a.Course)
                .Include(a => a.Teacher)
                .Where(a => a.StudentId == studentId && a.CourseId == courseId)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
        }
    }
}