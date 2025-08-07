import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Helper function to generate a unique public ID for posts
 * This mutation runs in the Convex runtime (no Node.js APIs)
 */
export const generatePostPublicId = mutation({
  args: {
    userId: v.string(),
    postType: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);

    return `posts/${args.userId}/${args.postType}_${timestamp}_${randomSuffix}`;
  },
});
