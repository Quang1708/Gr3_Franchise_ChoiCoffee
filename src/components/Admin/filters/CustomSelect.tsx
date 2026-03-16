import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  position?: "top" | "bottom";
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  icon,
  className,
  position = "bottom",
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div
      className={`relative w-full ${className || "sm:min-w-[200px]"}`}
      ref={containerRef}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 w-full px-3 py-2 text-sm bg-white border rounded-lg cursor-pointer transition-all select-none
            ${isOpen ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-gray-300"}`}
      >
        {icon && <span className="text-gray-500">{icon}</span>}
        <span
          className={`flex-1 truncate ${!selectedOption ? "text-gray-500" : "text-gray-700"}`}
        >
          {selectedOption ? selectedOption.label : placeholder || "Chọn..."}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 w-full bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-auto mt-1 ${position === "top" ? "bottom-full mb-1" : "mt-1"}`}
        >
          <div className="p-1">
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-md cursor-pointer ${opt.value === value ? "bg-primary/10 text-primary font-medium" : "text-gray-700 hover:bg-gray-50"}`}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check className="w-3.5 h-3.5" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
