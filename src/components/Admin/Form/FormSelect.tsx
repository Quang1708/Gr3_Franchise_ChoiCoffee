import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormSelectProps {
  label?: string;
  options: { value: string; label: string }[];
  register: UseFormRegisterReturn;
  error?: FieldError;
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (value: string) => void;
  name?: string; // Thêm prop name để hiển thị trong label "Xem tất cả {name}"
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
  name
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

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

  const allOptions = [
  { label: `Xem tất cả ${name}`, value: "" },
  ...options,
];

  const selectedOption = allOptions.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
  register.onChange({
    target: {
      name: register.name,
      value: val,
    },
  });

  onChange?.(val);

  setIsOpen(false);
  setSearch("");
};

  const filteredOptions = allOptions.filter((opt) =>
  opt.label.toLowerCase().includes(search.toLowerCase()),
);

  return (
    <div
      className={`relative w-full ${className || "sm:min-w-[200px]"}`}
      ref={containerRef}
    >
      {label && (
        <label className="block text-sm font-bold tracking-widest text-charcoal/80 ml-1 mb-2 uppercase">
          {label}
        </label>
      )}

      {/* select box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm bg-white border rounded-lg cursor-pointer
            ${
              error
                ? "border-primary ring-2 ring-primary/20"
                : "border-gray-200 hover:border-gray-300"
            }`}
      >
        <span
          className={`${selectedOption ? "text-gray-700" : "text-gray-400"}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                    ${
                      opt.value === value
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  <span className="truncate">{opt.label}</span>

                  {opt.value === value && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">
                Không tìm thấy
              </div>
            )}
          </div>
        </div>
      )}
      <input type="hidden" {...register} value={value || ""} />
    </div>
  );
};

export default FormSelect;
