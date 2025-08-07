import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upload a file and create a record
export const createFileUpload = mutation({
  args: {
    fileName: v.string(),
    fileUrl: v.string(),
    storageId: v.optional(v.string()),
    fileType: v.union(v.literal("image"), v.literal("video")),
    fileSize: v.optional(v.number()),
    category: v.string(),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user by clerk ID
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    return await ctx.db.insert("fileUploads", {
      userId: user._id,
      fileName: args.fileName,
      fileUrl: args.fileUrl,
      storageId: args.storageId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      category: args.category,
      relatedId: args.relatedId,
      uploadedAt: Date.now(),
    });
  },
});

// Get files by user and category
export const getFilesByCategory = query({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    return await ctx.db
      .query("fileUploads")
      .withIndex("by_user_and_category", (q) =>
        q.eq("userId", user._id).eq("category", args.category)
      )
      .order("desc")
      .collect();
  },
});

// Delete a file upload
export const deleteFileUpload = mutation({
  args: {
    fileId: v.id("fileUploads"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || file.userId !== user._id) {
      throw new Error("Not authorized to delete this file");
    }

    // Delete from storage if storageId exists
    if (file.storageId) {
      await ctx.storage.delete(file.storageId);
    }

    await ctx.db.delete(args.fileId);
  },
});

// Generate upload URL for Convex storage
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Get file URL from storage ID
export const getFileUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
