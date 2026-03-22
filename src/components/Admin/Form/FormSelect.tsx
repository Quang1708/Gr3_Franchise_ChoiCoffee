import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search, AlertCircle } from "lucide-react"; 
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormSelectProps {
  label?: string;
  options: { value: string; label: string; isExisting?: boolean }[];
  register: UseFormRegisterReturn;
  error?: FieldError | any; 
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  label,
  options,
  register,
  error,
  placeholder = "Chọn...",
  onChange,
  value,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState<string>(value ?? "");

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allOptions = options;
  const currentValue = value ?? internalValue;
  const selectedOption = allOptions.find((opt) => opt.value === currentValue);

  const handleSelect = (val: string) => {
    register.onChange({
      target: {
        name: register.name,
        value: val,
      },
    });

    if (onChange) {
      onChange(val);
    } else {
      setInternalValue(val);
    }

    setIsOpen(false);
    setSearch("");
  };

  const filteredOptions = allOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className={`relative w-full ${className || "sm:min-w-50"}`}
      ref={containerRef}
    >
      {label && (
        <label className={`block text-[14px] font-medium ml-1 mb-2 ${error ? "text-primary" : "text-gray-500"}`}>
          {label}
        </label>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-lg cursor-pointer transition-all
            ${error
            ? "border-primary ring-2 ring-primary/20 shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]"
            : "border-gray-200 hover:border-gray-300"
          }`}
      >
        <span
          className={`${selectedOption ? "text-gray-700" : "text-gray-400"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {error && (
        <p className="mt-1.5 ml-1 text-xs text-primary flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={12} />
          {error.message}
        </p>
      )}

      {/* dropdown */}
      {isOpen && (
        <div className="absolute z-100 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden animate-in zoom-in-95 duration-150">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          </div>

          <div className="max-h-60 overflow-auto p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer transition-colors
                    ${opt.value === currentValue ? "bg-primary/10 text-primary font-medium" : "hover:bg-gray-100"}
                    ${opt.isExisting ? "text-primary font-medium" : ""}`}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === currentValue && <Check className="w-3.5 h-3.5 shrink-0" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400 italic">
                Không tìm thấy kết quả
              </div>
            )}
          </div>
        </div>
      )}
      {/* Input ẩn để react-hook-form lấy giá trị */}
      <input type="hidden" {...register} value={currentValue} />
    </div>
  );
};

export default FormSelect;