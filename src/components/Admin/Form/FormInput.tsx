import React, { useState, useEffect } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";

// Ảnh mặc định khi không có avatar
const DEFAULT_AVATAR = "https://i.pinimg.com/736x/af/80/37/af80374611f4673d1928a881727e13b0.jpg";

interface FormInputProps {
    label: string;
    type?: "text" | "email" | "password" | "file" | "tel" | "number" | "date" | "time";
    variant?: "avatar" | "file";
    register: any;
    error?: any;
    defaultValue?: string | number;
    placeholder?: string;
    isView?: boolean;
    className?: string;
    onUploadSuccess?: (url: string) => void;
    isDisabled?: boolean;
    setIsExternalLoading?: (loading: boolean) => void;
    uploadFolder?: string;
    step?: string | number;
}

export const FormInput = ({
    label, type = "text", register, error, defaultValue, placeholder, isView, className, onUploadSuccess, isDisabled, setIsExternalLoading, uploadFolder = "customers", step
}: FormInputProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(defaultValue);
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
            const res = await uploadImage(file, { folder: uploadFolder });
            if (res?.secure_url) onUploadSuccess?.(res.secure_url);
        } finally {
            setIsExternalLoading?.(false);
        }
    };

    if (type === "time") {
      return (
        <div className={`flex flex-col ${className}`}>
          <label className="text-xs font-bold text-gray-500 uppercase">
            {label}
          </label>
          <input
            type={type}
            defaultValue={defaultValue}
            placeholder={placeholder}
            {...register}
            disabled={isDisabled}
            className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 
                    ${error ? "border-primary" : "border-gray-200 focus:border-primary"} 
                    ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          />
          {error && (
            <p className="text-primary text-xs mt-1">{error.message}</p>
          )}
        </div>
      );
    }
    // Render cho loại File (Avatar)
    if (type === "file") {
    const inputId = `file-upload-${label?.replace(/\s+/g, '-').toLowerCase() || 'default'}`;    

    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-[12px] font-semibold text-gray-600">
                    {label}
                </label>
            )}
            <div className="flex gap-6 items-start">
                {!isView && (
                    <div className="text-center">
                        <label
                            htmlFor={inputId}
                            className={`w-[120px] h-[120px] flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-lg transition bg-gray-50 ${
                                isUploading || isDisabled 
                                ? "cursor-not-allowed opacity-50" 
                                : "cursor-pointer hover:border-primary"
                            }`}
                        >
                            <Camera className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-400 mt-1">
                                {isUploading ? "Đang tải..." : "Chọn ảnh"}
                            </span>
                        </label>

                        <input
                            id={inputId}
                            type="file"
                            className="hidden"
                            accept="image/png,image/jpeg,image/jpg,image/gif"
                            onChange={handleFileChange}
                            disabled={isDisabled || isUploading}
                        />
                    </div>
                )}

                {/* Khu vực hiển thị ảnh */}
                <div className="relative group">
                    <img
                        src={String(previewUrl || defaultValue || DEFAULT_AVATAR)}
                        alt="avatar"
                        className={`w-[120px] h-[120px] object-cover rounded-lg shadow border-2 border-white transition-all ${
                            isUploading ? "brightness-50" : ""
                        }`}
                    />

                    {/* Spinner khi đang upload ảnh */}
                    {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                </div>
            </div>
            
            {error && (
                <p className="text-primary text-xs mt-1">{error.message}</p>
            )}
        </div>
    );
}

    // Render cho các loại Text/Password/Email
    return (
      <div className={`flex flex-col ${className}`}>
        <label className="text-xs font-bold text-gray-500 uppercase">
          {label}
        </label>
        <div className="relative">
          {isView ? (
            <div className="py-2 border-b border-gray-300 min-h-[38px]">
              <span className="text-sm font-semibold text-gray-700">
                {type === "password" ? "••••••••" : defaultValue || "Không có"}
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
                step={step}
                className={`w-full px-4 py-2 bg-gray-50 border rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-primary/20 
                                ${error ? "border-primary" : "border-gray-200 focus:border-primary"} 
                                ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              />
              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
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