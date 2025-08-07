"use node";
import crypto from "crypto";
import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Generate Cloudinary upload signature using Node.js crypto
 * This is a Node.js action that can use crypto library
 */
export const generateCloudinarySignature = action({
  args: { params: v.record(v.string(), v.string() || v.number()) },
  handler: async (ctx, args) => {
    // Get environment variables
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Missing Cloudinary configuration");
    }

    // Create signature string (alphabetically sorted parameters)
    const signatureString = Object.keys(args.params)
      .sort()
      .map((key) => `${key}=${args.params[key]}`)
      .join("&");

    // Generate signature using crypto
    const signature = crypto
      .createHash("sha1")
      .update(signatureString + apiSecret)
      .digest("hex");

    // Return signature data
    return {
      signature,
      api_key: apiKey,
      cloud_name: cloudName,
      ...args.params,
    };
  },
});
