import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

interface UploadResult {
  fileUrl: string;
  fileId?: string;
  error?: string;
}

interface UseImageUploadProps {
  category: string;
  maxSize?: number; // in MB
  quality?: number; // 0-1
  resize?: { width: number; height: number };
}

export const useImageUpload = ({
  category,
  maxSize = 5,
  quality = 0.8,
  resize,
}: UseImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const generateUploadUrl = useMutation(api.fileUploads.generateUploadUrl);
  const createFileUpload = useMutation(api.fileUploads.createFileUpload);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access camera roll is required!");
    }
  };

  const pickImage = async (): Promise<string | null> => {
    await requestPermissions();

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: resize ? [resize.width, resize.height] : [1, 1],
      quality: quality,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async (): Promise<string | null> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access camera is required!");
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: resize ? [resize.width, resize.height] : [1, 1],
      quality: quality,
    });

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }
    return null;
  };

  const processImage = async (uri: string): Promise<string> => {
    if (resize) {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: resize }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult.uri;
    }
    return uri;
  };

  const uploadToConvex = async (imageUri: string): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Process image if needed
      const processedUri = await processImage(imageUri);
      setUploadProgress(25);

      // Get upload URL
      const uploadUrl = await generateUploadUrl();
      setUploadProgress(50);

      // Convert image to blob
      const response = await fetch(processedUri);
      const blob = await response.blob();

      // Check file size
      const fileSizeInMB = blob.size / (1024 * 1024);
      if (fileSizeInMB > maxSize) {
        throw new Error(
          `File size (${fileSizeInMB.toFixed(1)}MB) exceeds limit of ${maxSize}MB`
        );
      }

      setUploadProgress(75);

      // Upload to Convex
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload image");
      }

      const { storageId } = await uploadResponse.json();
      setUploadProgress(90);

      // Create file record
      const fileName = `${category}-${Date.now()}.jpg`;
      const fileId = await createFileUpload({
        fileName,
        fileUrl: "", // Will be generated from storageId when needed
        storageId,
        fileType: "image",
        fileSize: blob.size,
        category,
      });

      setUploadProgress(100);

      return {
        fileUrl: storageId, // Return storageId as fileUrl for now
        fileId: fileId,
      };
    } catch (error) {
      console.error("Upload error:", error);
      return {
        fileUrl: "",
        error: error instanceof Error ? error.message : "Upload failed",
      };
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    isUploading,
    uploadProgress,
    pickImage,
    takePhoto,
    uploadToConvex,
    uploadImage: async (
      source: "gallery" | "camera" = "gallery"
    ): Promise<UploadResult> => {
      try {
        const imageUri =
          source === "gallery" ? await pickImage() : await takePhoto();

        if (!imageUri) {
          return { fileUrl: "", error: "No image selected" };
        }

        return await uploadToConvex(imageUri);
      } catch (error) {
        return {
          fileUrl: "",
          error:
            error instanceof Error ? error.message : "Failed to select image",
        };
      }
    },
  };
};

export type { UploadResult };
