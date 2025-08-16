import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Create a new comment on a post
 */
export const createComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
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

    // Get the post to verify it exists
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("Post not found");
    }

    // Create comment
    const commentId = await ctx.db.insert("comments", {
      userId: user._id,
      postId: args.postId,
      content: args.content.trim(),
      isDeleted: false,
      createdAt: Date.now(),
    });

    // Update post comment count
    await ctx.db.patch(args.postId, {
      commentCount: post.commentCount + 1,
      updatedAt: Date.now(),
    });

    console.log(`Created comment ${commentId} on post ${args.postId} by user ${user.username}`);

    return commentId;
  },
});

/**
 * Get comments for a specific post
 */
export const getPostComments = query({
  args: {
    postId: v.id("posts"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get comments for the post, ordered by creation time (newest first)
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("isDeleted"), false))
      .order("desc")
      .take(limit);

    // Enhance comments with user data
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          id: comment._id,
          user: user
            ? {
                username: user.username,
                avatarUrl: user.avatarUrl,
                isVerified: user.isVerified,
              }
            : {
                username: "Unknown User",
                avatarUrl: undefined,
                isVerified: false,
              },
          text: comment.content,
          createdAt: comment.createdAt,
          likeCount: 0, // TODO: Implement comment likes later
        };
      })
    );

    return commentsWithUsers;
  },
});

/**
 * Delete a comment (soft delete)
 */
export const deleteComment = mutation({
  args: {
    commentId: v.id("comments"),
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

    // Get comment
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user owns the comment
    if (comment.userId !== user._id) {
      throw new Error("Not authorized to delete this comment");
    }

    // Soft delete the comment
    await ctx.db.patch(args.commentId, {
      isDeleted: true,
    });

    // Update post comment count
    const post = await ctx.db.get(comment.postId);
    if (post && post.commentCount > 0) {
      await ctx.db.patch(comment.postId, {
        commentCount: post.commentCount - 1,
        updatedAt: Date.now(),
      });
    }

    console.log(`Deleted comment ${args.commentId} by user ${user.username}`);

    return { success: true };
  },
});

/**
 * Get comment count for a post
 */
export const getCommentCount = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    return post?.commentCount || 0;
  },
});