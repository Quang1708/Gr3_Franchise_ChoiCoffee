import React, { useState, useRef, useEffect } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

// Ảnh mặc định khi không có avatar
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

interface FormInputProps {
    label: string;
    type?: "text" | "email" | "password" | "file" | "tel";
    register: any;
    error?: any;
    defaultValue?: string;
    placeholder?: string;
    isView?: boolean;
    className?: string;
    onUploadSuccess?: (url: string) => void;
    isDisabled?: boolean;
    setIsExternalLoading?: (loading: boolean) => void;
}

export const FormInput = ({
    label, type = "text", register, error, defaultValue, placeholder, isView, className, onUploadSuccess, isDisabled, setIsExternalLoading
}: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(defaultValue);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, isUploading } = useImageUpload();

    useEffect(() => {
        setPreviewUrl(defaultValue);
    }, [defaultValue]);

    // Xử lý upload file
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setIsExternalLoading?.(true);
        try {
            const res = await uploadImage(file, { folder: "customers" });
            if (res?.secure_url) onUploadSuccess?.(res.secure_url);
        } finally {
            setIsExternalLoading?.(false);
        }
    };

    // Render cho loại File (Avatar)
    if (type === "file") {
        return (
            <div className={`flex flex-col items-center gap-2 ${className}`}>
                <div className="relative w-24 h-24">
                    <div className={`w-full h-full rounded-full overflow-hidden border-2 flex items-center justify-center bg-gray-50 
                        ${isView ? 'border-gray-100' : 'border-white shadow-sm'}`}>
                        <img
                            src={previewUrl || DEFAULT_AVATAR}
                            className="w-full h-full object-cover"
                            alt="avatar"
                        />
                        {isUploading && (
                            <div className="absolute inset-0 bg-white/40 flex items-center justify-center animate-pulse">
                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    {!isView && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isDisabled || isUploading}
                            className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-110 transition-all disabled:opacity-50">
                            <Camera className="w-3 h-3" />
                        </button>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
            </div>
        );
    }

    // Render cho các loại Text/Password/Email
    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{label}</label>
            <div className="relative">
                {isView ? (
                    <div className="py-2 border-b border-gray-300 min-h-[38px]">
                        <span className="text-sm font-semibold text-gray-700">
                            {type === "password" ? "••••••••" : (defaultValue || "")}
                        </span>
                    </div>
                ) : (
                    <>
                        <input
                            type={type === "password" && showPassword ? "text" : type}
                            defaultValue={defaultValue}
                            placeholder={placeholder}
                            {...register}
                            disabled={isDisabled}
                            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 
                                ${error ? "border-red-500" : "border-gray-200 focus:border-primary"} 
                                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        />
                        {type === "password" && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )}
                    </>
                )}
            </div>
            {error && <p className="text-primary text-xs mt-1">{error.message}</p>}
        </div>
    );
};