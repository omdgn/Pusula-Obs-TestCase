// src/pages/student/MyAttendance.jsx
import { useState, useEffect } from "react";
import Table from "../../components/Table";
import Chart from "../../components/Chart";
import { getMyAttendance } from "../../services/studentService";
import {
  Calendar, CheckCircle, XCircle, AlertCircle, Clock, TrendingUp
} from "lucide-react";

export default function MyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError(null);
        const attendanceData = await getMyAttendance();
        setAttendance(attendanceData);
        setFilteredAttendance(attendanceData);
      } catch (err) {
        console.error("Attendance fetch error:", err);

        if (err.response?.status === 403) {
          setError("Yetki hatası. Lütfen çıkış yapıp tekrar giriş yapın.");
        } else if (err.response?.status === 401) {
          setError("Oturum süresi dolmuş. Yeniden giriş yapın.");
        } else {
          setError("Devamsızlık kayıtları yüklenirken bir hata oluştu: " + (err.message || "Bilinmeyen hata"));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Filter attendance based on selected course and status
  useEffect(() => {
    let filtered = attendance;

    if (selectedCourse !== "all") {
      filtered = filtered.filter(record => record.courseId.toString() === selectedCourse);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(record => record.status === selectedStatus);
    }

    setFilteredAttendance(filtered);
  }, [attendance, selectedCourse, selectedStatus]);

  // Calculate statistics
  const statistics = {
    totalClasses: filteredAttendance.length,
    presentCount: filteredAttendance.filter(record => record.status === "Present").length,
    absentCount: filteredAttendance.filter(record => record.status === "Absent").length,
    lateCount: filteredAttendance.filter(record => record.status === "Late").length,
    attendanceRate: filteredAttendance.length > 0
      ? Math.round((filteredAttendance.filter(record => record.status === "Present").length / filteredAttendance.length) * 100)
      : 0
  };

  // Get unique courses for filters
  const courses = [...new Set(attendance.map(record => ({
    id: record.courseId,
    name: record.courseName
  })).filter((course, index, arr) =>
    arr.findIndex(c => c.id === course.id) === index
  ))];

  // Prepare chart data - attendance by course
  const courseAttendanceData = courses.map(course => {
    const courseRecords = filteredAttendance.filter(record => record.courseId === course.id);
    const presentCount = courseRecords.filter(record => record.status === "Present").length;
    const totalCount = courseRecords.length;
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    return {
      name: course.name,
      rate: rate,
      present: presentCount,
      total: totalCount
    };
  });

  // Status rendering helpers
  const getStatusBadge = (status) => {
    const statusConfig = {
      Present: {
        icon: <CheckCircle className="w-4 h-4" />,
        className: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-400",
        text: "Katıldı"
      },
      Absent: {
        icon: <XCircle className="w-4 h-4" />,
        className: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400",
        text: "Katılmadı"
      },
      Late: {
        icon: <Clock className="w-4 h-4" />,
        className: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-400",
        text: "Geç Geldi"
      },
      Excused: {
        icon: <AlertCircle className="w-4 h-4" />,
        className: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-400",
        text: "Mazeret"
      }
    };

    const config = statusConfig[status] || statusConfig.Absent;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.icon}
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Table columns
  const columns = [
    {
      header: "Ders",
      key: "courseName",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-600">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {row.courseId}</div>
        </div>
      )
    },
    {
      header: "Tarih",
      key: "date",
      render: (value) => (
        <div className="font-medium text-gray-900 dark:text-gray-600">
          {formatDate(value)}
        </div>
      )
    },
    {
      header: "Durum",
      key: "status",
      render: (value) => getStatusBadge(value)
    },
    {
      header: "Notlar",
      key: "notes",
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value || "-"}
        </span>
      )
    },
    {
      header: "Kayıt Tarihi",
      key: "createdAt",
      render: (value) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(value)}
        </div>
      )
    }
  ];

  const handleExport = () => {
    console.log("Exporting attendance...");
    // TODO: Implement export functionality
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredAttendance(attendance);
      return;
    }

    const filtered = attendance.filter(record =>
      record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.notes && record.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredAttendance(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Yeniden Dene
          </button>
          {(error.includes("Yetki hatası") || error.includes("Oturum süresi")) && (
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Çıkış Yap
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-600">
            Devamsızlık Durumu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Ders katılım durumunu ve devamsızlık oranını takip et
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Ders</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.totalClasses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Katıldım</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.presentCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Katılmadım</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.absentCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Geç Kaldım</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  {statistics.lateCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Devam Oranı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-600">
                  %{statistics.attendanceRate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ders Filtresi
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-600"
              >
                <option value="all">Tüm Dersler</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Durum Filtresi
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-600"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="Present">Katıldı</option>
                <option value="Absent">Katılmadı</option>
                <option value="Late">Geç Geldi</option>
                <option value="Excused">Mazeret</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chart */}
        {courseAttendanceData.length > 0 && (
          <div className="mb-8">
            <Chart
              type="bar"
              data={courseAttendanceData}
              title="Derslere Göre Devam Oranı (%)"
              dataKey="rate"
              xAxisKey="name"
              height={300}
              showGrid={true}
              showTooltip={true}
            />
          </div>
        )}

        {/* Attendance Table */}
        <Table
          title="Devamsızlık Listesi"
          columns={columns}
          data={filteredAttendance}
          loading={loading}
          searchable={true}
          exportable={true}
          onSearch={handleSearch}
          onExport={handleExport}
          emptyMessage="Henüz devamsızlık kaydınız bulunmuyor"
        />
      </div>
  );
}