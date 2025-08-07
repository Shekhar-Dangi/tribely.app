/**
 * Direct HTTP upload to Cloudinary using signed parameters
 * Compatible with Expo 53 - no external dependencies needed
 */

interface CloudinaryUploadParams {
  signature: string;
  api_key: string;
  cloud_name: string;
  timestamp: number;
  public_id: string;
  [key: string]: any;
}

interface CloudinaryUploadResponse {
  public_id: string;
  secure_url: string;
  url: string;
  asset_id: string;
  version: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
  [key: string]: any;
}

interface CloudinaryUploadResult {
  success: boolean;
  data?: CloudinaryUploadResponse;
  error?: string;
}

/**
 * Upload image to Cloudinary using direct HTTP POST with signed parameters
 */
export async function uploadToCloudinary(
  imageUri: string,
  uploadParams: CloudinaryUploadParams
): Promise<CloudinaryUploadResult> {
  try {
    // Create FormData for multipart upload
    const formData = new FormData();

    // Add the image file
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg", // Default to JPEG, can be made dynamic later
      name: "image.jpg",
    } as any);

    // Add all upload parameters
    Object.keys(uploadParams).forEach((key) => {
      formData.append(key, uploadParams[key].toString());
    });

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${uploadParams.cloud_name}/image/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error:
          errorData.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      data: data as CloudinaryUploadResponse,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
}
