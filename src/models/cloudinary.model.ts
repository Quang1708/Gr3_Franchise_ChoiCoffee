/**
 * Interface cho response từ Cloudinary
 */
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_id: string;
  version_id: string;
}

/**
 * Interface cho options khi upload
 */
export interface CloudinaryUploadOptions {
  folder?: string; // Thư mục lưu trữ trong Cloudinary
  tags?: string[]; // Tags để phân loại ảnh
  public_id?: string; // Custom public ID
  transformation?: string; // Transformation options
  maxSizeInMB?: number; // Kích thước file tối đa (MB), mặc định 5MB
  allowedFormats?: string[]; // Các format được phép, mặc định: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  quality?: "auto" | number; // Quality optimization, mặc định 'auto'
  autoOptimize?: boolean; // Tự động optimize ảnh, mặc định true
}

/**
 * Interface cho options tạo transformation
 */
export interface TransformationOptions {
  width?: number;
  height?: number;
  crop?: "scale" | "fit" | "limit" | "fill" | "pad" | "thumb";
  quality?: "auto" | "auto:best" | "auto:good" | "auto:low" | number;
  format?: "auto" | "jpg" | "png" | "webp";
  gravity?: "auto" | "face" | "center" | "north" | "south" | "east" | "west";
  radius?: number | "max";
  background?: string;
  effect?: string;
}
