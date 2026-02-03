import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const InputForm = ({ label, type = "text", className, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  // Tentukan tipe input aktual berdasarkan state showPassword
  const actualType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div
      className={`relative bg-white rounded-lg border border-gray-200 px-3 pt-5 pb-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary ${className}`}
    >
      <label className="absolute top-2 left-3 text-xs font-medium text-primary">
        {label}
      </label>

      <input
        type={actualType}
        className="block w-full border-0 p-0 text-dark placeholder-gray-400 focus:ring-0 sm:text-sm sm:leading-6 outline-none bg-transparent font-medium"
        {...props}
      />

      {isPasswordType && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Eye className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
};

export default InputForm;
