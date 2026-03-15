import React, { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder: string;
  error?: FieldError;
  register: UseFormRegisterReturn;
  showPasswordToggle?: boolean;
  icon?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type = "text",
  placeholder,
  error,
  register,
  showPasswordToggle = false,
  icon,
  className = "",
  labelClassName = "",
  inputClassName = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const inputType = showPasswordToggle
    ? showPassword
      ? "text"
      : "password"
    : type;

  // Tạo className động cho input dựa trên error state
  const getInputClassName = () => {
    if (inputClassName) {
      // Nếu có custom className, thêm class error vào
      return error
        ? `${inputClassName} !border-primary focus:!ring-primary/20 focus:!border-primary`
        : inputClassName;
    }
    // Default className với error state
    return error
      ? "w-full pl-4 pr-10 py-3 bg-neutral-soft border-2 border-primary rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-charcoal font-medium shadow-sm text-sm"
      : "w-full pl-4 pr-10 py-3 bg-neutral-soft border border-primary rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all text-charcoal font-medium shadow-sm text-sm";
  };

  return (
    <div className={className}>
      <label
        className={
          labelClassName ||
          "block text-sm font-bold tracking-widest text-charcoal/80 ml-1 mb-2"
        }
      >
        {label}
      </label>
      <div className="relative group">
        <input
          className={getInputClassName()}
          placeholder={placeholder}
          type={inputType}
          {...register}
        />
        {showPasswordToggle && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/30 hover:text-charcoal transition-colors"
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility" : "visibility_off"}
            </span>
          </button>
        )}
        {icon && !showPasswordToggle && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      <div className="min-h-[18px] mt-1">
        {error && (
          <span className="text-xs text-primary ml-1 block">
            {error.message}
          </span>
        )}
      </div>
    </div>
  );
};

export default FormInput;
