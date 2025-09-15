// src/components/Table.jsx
import { useTheme } from "../context/ThemeContext";
import { Search, Filter, Download, MoreVertical } from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  title,
  searchable = true,
  filterable = true,
  exportable = true,
  actions = [],
  onSearch,
  onFilter,
  onExport,
  loading = false,
  emptyMessage = "Veri bulunamad1"
}) {
  const { isDark } = useTheme();

  return (
    <div
      className={`rounded-2xl shadow-md border ${
        isDark
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      {(title || searchable || filterable || exportable) && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {title && (
              <h3
                className={`text-lg font-semibold ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                {title}
              </h3>
            )}

            <div className="flex items-center gap-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    onChange={(e) => onSearch?.(e.target.value)}
                    className={`pl-10 pr-4 py-2 rounded-lg border text-sm ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                    } focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
              )}

              {filterable && (
                <button
                  onClick={onFilter}
                  className={`p-2 rounded-lg border transition ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
              )}

              {exportable && (
                <button
                  onClick={onExport}
                  className={`p-2 rounded-lg border transition ${
                    isDark
                      ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className={`border-b ${
                isDark ? "border-gray-700" : "border-gray-200"
              }`}
            >
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {actions.length > 0 && (
                <th
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  0_lemler
                </th>
              )}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-8 text-center"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  className={`px-6 py-8 text-center text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`transition ${
                    isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                  }`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-900"
                      }`}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row, rowIndex)}
                            className={`p-1 rounded transition ${
                              action.variant === "danger"
                                ? isDark
                                  ? "text-red-400 hover:bg-red-900/20"
                                  : "text-red-600 hover:bg-red-50"
                                : action.variant === "warning"
                                ? isDark
                                  ? "text-yellow-400 hover:bg-yellow-900/20"
                                  : "text-yellow-600 hover:bg-yellow-50"
                                : isDark
                                ? "text-gray-400 hover:bg-gray-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                            title={action.label}
                          >
                            <action.icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}