import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Like a post
 */
export const likePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user from database
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user already liked this post
    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (existingLike) {
      // Unlike - remove like
      await ctx.db.delete(existingLike._id);
      
      return { liked: false };
    } else {
      // Like - add like
      await ctx.db.insert("likes", {
        userId: user._id,
        postId: args.postId,
        createdAt: Date.now(),
      });
      
      return { liked: true };
    }
  },
});