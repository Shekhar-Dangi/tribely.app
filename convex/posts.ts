import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new post with media URL from Cloudinary
 */
export const createPost = mutation({
  args: {
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaPublicId: v.optional(v.string()), // For future deletions from Cloudinary
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    privacy: v.union(
      v.literal("public"),
      v.literal("friends"),
      v.literal("private")
    ),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Get current user
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

    // Create post
    const postId = await ctx.db.insert("posts", {
      userId: user._id,
      content: args.content?.trim() || undefined,
      mediaUrl: args.mediaUrl,
      mediaPublicId: args.mediaPublicId,
      mediaType: args.mediaType,
      privacy: args.privacy,
      likeCount: 0,
      commentCount: 0,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log(`Created post ${postId} for user ${user.username}`);

    return postId;
  },
});

/**
 * Get posts for feed (public posts + user's own posts)
 */
export const getFeedPosts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get public posts ordered by creation time
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_public_posts", (q) => q.eq("privacy", "public"))
      .order("desc")
      .take(limit);

    // Enhance posts with user data
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          user: user
            ? {
                username: user.username,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
                isPremium: user.isPremium,
              }
            : null,
        };
      })
    );

    return postsWithUsers;
  },
});

/**
 * Get posts by a specific user
 */
export const getUserPosts = query({
  args: {
    userId: v.id("users"),
    privacy: v.optional(
      v.union(v.literal("public"), v.literal("friends"), v.literal("private"))
    ),
  },
  handler: async (ctx, args) => {
    let posts;

    if (args.privacy) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_user_and_privacy", (q) =>
          q.eq("userId", args.userId).eq("privacy", args.privacy!)
        )
        .order("desc")
        .collect();
    } else {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
    }

    // Get user data for each post
    const postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        return {
          ...post,
          user: user
            ? {
                username: user.username,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
                isPremium: user.isPremium,
              }
            : null,
        };
      })
    );

    return postsWithUsers;
  },
});

/**
 * Delete a post (and optionally its media from Cloudinary)
 */
export const deletePost = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    // Get current user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get post
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user owns the post
    if (post.userId !== user._id) {
      throw new Error("Not authorized to delete this post");
    }

    // TODO: Delete media from Cloudinary using mediaPublicId
    // This would be implemented later with Cloudinary's destroy API

    // Delete post from database
    await ctx.db.delete(args.postId);

    console.log(`Deleted post ${args.postId} by user ${user.username}`);

    return { success: true };
  },
});
