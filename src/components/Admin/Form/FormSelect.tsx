import React from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormSelectProps {
    label: string;
    options: { label: string; value: string }[];
    register: UseFormRegisterReturn;
    error?: FieldError;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, options, register, error }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-bold tracking-widest text-charcoal/80 ml-1 mb-2 uppercase">
                {label}
            </label>
            <div className="relative">
                <select
                    {...register}
                    className={`w-full px-4 py-3 bg-neutral-soft border rounded-lg appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium ${error ? "border-primary" : "border-gray-200"
                        }`}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-charcoal/30">
                    expand_more
                </span>
            </div>
        </div>
    );
};

export default FormSelect;