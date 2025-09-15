// src/components/FormInput.jsx
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";

export default function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  success,
  helperText,
  icon,
  className = "",
  ...props
}) {
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const baseClasses = `w-full px-3 py-2 rounded-lg border transition focus:outline-none focus:ring-2 ${
    icon ? "pl-10" : ""
  } ${isPassword ? "pr-10" : ""} ${
    error
      ? "border-red-500 focus:ring-red-500"
      : success
      ? "border-green-500 focus:ring-green-500"
      : "focus:ring-indigo-500"
  } ${
    isDark
      ? error
        ? "bg-red-900/20 border-red-500 text-red-100 placeholder-red-300"
        : success
        ? "bg-green-900/20 border-green-500 text-green-100 placeholder-green-300"
        : "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
      : error
      ? "bg-red-50 border-red-500 text-red-900 placeholder-red-400"
      : success
      ? "bg-green-50 border-green-500 text-green-900 placeholder-green-400"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
  } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`;

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={name}
          className={`block text-sm font-medium ${
            error
              ? isDark
                ? "text-red-400"
                : "text-red-600"
              : success
              ? isDark
                ? "text-green-400"
                : "text-green-600"
              : isDark
              ? "text-gray-200"
              : "text-gray-700"
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <icon.type
              className={`w-5 h-5 ${
                error
                  ? isDark
                    ? "text-red-400"
                    : "text-red-500"
                  : success
                  ? isDark
                    ? "text-green-400"
                    : "text-green-500"
                  : isDark
                  ? "text-gray-400"
                  : "text-gray-400"
              }`}
            />
          </div>
        )}

        <input
          type={inputType}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={baseClasses}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-400"
                }`}
              />
            ) : (
              <Eye
                className={`w-5 h-5 ${
                  isDark ? "text-gray-400" : "text-gray-400"
                }`}
              />
            )}
          </button>
        )}

        {(error || success) && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {error ? (
              <AlertCircle
                className={`w-5 h-5 ${
                  isDark ? "text-red-400" : "text-red-500"
                }`}
              />
            ) : (
              <CheckCircle
                className={`w-5 h-5 ${
                  isDark ? "text-green-400" : "text-green-500"
                }`}
              />
            )}
          </div>
        )}
      </div>

      {(error || success || helperText) && (
        <div
          className={`text-sm ${
            error
              ? isDark
                ? "text-red-400"
                : "text-red-600"
              : success
              ? isDark
                ? "text-green-400"
                : "text-green-600"
              : isDark
              ? "text-gray-400"
              : "text-gray-500"
          }`}
        >
          {error || success || helperText}
        </div>
      )}
    </div>
  );
}