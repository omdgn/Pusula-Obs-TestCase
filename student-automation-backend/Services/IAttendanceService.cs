using StudentAutomation.Models;
using StudentAutomation.Models.Dtos;

namespace StudentAutomation.Services
{
    public interface IAttendanceService
    {
        Task<Attendance> RecordAttendanceAsync(RecordAttendanceDto dto, Guid teacherId);
        Task<Attendance> UpdateAttendanceAsync(Guid attendanceId, UpdateAttendanceDto dto, Guid teacherId);
        Task DeleteAttendanceAsync(Guid attendanceId, Guid teacherId);
        Task<List<Attendance>> GetAttendancesByStudentIdAsync(Guid studentId);
        Task<List<Attendance>> GetAttendancesByCourseIdAsync(Guid courseId, Guid teacherId);
        Task<List<Attendance>> GetAttendancesByDateAsync(DateTime date, Guid teacherId);
        Task<Attendance?> GetAttendanceByIdAsync(Guid attendanceId);
        Task<List<Attendance>> GetAttendancesByStudentAndCourseAsync(Guid studentId, Guid courseId);
    }
}