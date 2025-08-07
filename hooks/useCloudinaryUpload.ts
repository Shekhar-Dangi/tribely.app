import { useState } from "react";
import { useAction, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { uploadToCloudinary } from "@/utils/cloudinaryUpload";
import { useUser } from "@clerk/clerk-expo";

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface UploadResult {
  success: boolean;
  imageUrl?: string;
  publicId?: string;
  error?: string;
}

/**
 * Custom hook for uploading images to Cloudinary with Convex backend integration
 */
export function useCloudinaryUpload() {
  const convex = useConvex();
  const { user } = useUser();
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });
  const generateSignature = useAction(
    api.cloudinaryActions.generateCloudinarySignature
  );

  const uploadImage = async (imageUri: string): Promise<UploadResult> => {
    if (!user?.id) {
      return { success: false, error: "User not authenticated" };
    }

    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
    });

    try {
      // Step 1: Generate unique public ID for the post
      setUploadState((prev) => ({ ...prev, progress: 20 }));

      const publicId = await convex.mutation(
        api.cloudinary.generatePostPublicId,
        {
          userId: user.id,
          postType: "image",
        }
      );

      // Step 2: Get signed upload parameters from Convex
      setUploadState((prev) => ({ ...prev, progress: 40 }));

      const timestamp = Math.floor(Date.now() / 1000);

      const uploadParams = await generateSignature({
        params: {
          public_id: publicId,
          timestamp: timestamp.toString(),
        },
      });

      // Step 3: Upload to Cloudinary
      setUploadState((prev) => ({ ...prev, progress: 60 }));

      const cloudinaryParams = {
        ...uploadParams,
        timestamp,
        public_id: publicId,
      };

      const uploadResult = await uploadToCloudinary(imageUri, cloudinaryParams);

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || "Upload failed");
      }

      // Step 4: Complete
      setUploadState((prev) => ({ ...prev, progress: 100 }));

      const result = {
        success: true,
        imageUrl: uploadResult.data.secure_url,
        publicId: uploadResult.data.public_id,
      };

      // Reset state after success
      setTimeout(() => {
        setUploadState({
          isUploading: false,
          progress: 0,
          error: null,
        });
      }, 1000);

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";

      setUploadState({
        isUploading: false,
        progress: 0,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    uploadImage,
    ...uploadState,
  };
}
