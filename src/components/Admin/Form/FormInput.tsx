import React, { useState, useRef, useEffect } from "react";
import { Camera, Loader2, Eye, EyeOff } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

interface FormInputProps {
    label: string;
    type?: "text" | "email" | "password" | "file" | "tel" | "number";
    register: any;
    error?: any;
    defaultValue?: string | number;
    placeholder?: string;
    isView?: boolean;
    className?: string;
    onUploadSuccess?: (url: string) => void;
    isDisabled?: boolean;
}

export const FormInput = ({
    label, type = "text", register, error, defaultValue, placeholder, isView, className, onUploadSuccess, isDisabled
}: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(defaultValue);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isUploading } = useImageUpload();

    useEffect(() => {
        setPreviewUrl(defaultValue);
    }, [defaultValue]);

    if (isView && type !== "file") {
        return (
            <div className={`flex flex-col gap-1 ${className}`}>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="py-2 border-b border-gray-100 min-h-[38px]">
                    <span className="text-sm font-semibold text-gray-700">
                        {type === "password" ? "••••••••" : (defaultValue || "---")}
                    </span>
                </div>
            </div>
        );
    }

    if (type === "file") {
        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setPreviewUrl(URL.createObjectURL(file));
            try {
                const res = await uploadImage(file, { folder: "customers" });
                if (res?.secure_url) onUploadSuccess?.(res.secure_url);
            } catch (err) { console.error(err); }
        };

        return (
            <div className={`flex flex-col items-center gap-2 ${className}`}>
                <div className="relative w-24 h-24 group">
                    <div className={`w-full h-full rounded-full overflow-hidden border-2 bg-gray-50 flex items-center justify-center transition-all ${isView ? 'border-gray-200' : 'border-white shadow-md'}`}>
                        {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-300" />}
                        {isUploading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-full"><Loader2 className="animate-spin text-white" /></div>}
                    </div>
                    {!isView && !isUploading && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isDisabled} className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            <Camera className="w-3 h-3" />
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" disabled={isDisabled} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
            </div>
        );
    }

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{label}</label>
            <div className="relative">
                <input
                    type={type === "password" && showPassword ? "text" : type}
                    defaultValue={defaultValue}
                    placeholder={placeholder}
                    disabled={isDisabled}
                    {...register}
                    className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 ${error ? "border-red-500" : "border-gray-200 focus:border-primary"} ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {type === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isDisabled} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 disabled:opacity-50">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                )}
            </div>
            {error && <span className="text-[10px] text-red-500 italic mt-1">{error.message}</span>}
        </div>
    );
};