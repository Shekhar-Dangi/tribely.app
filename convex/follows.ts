import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Follow/Unfollow user
export const followUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { followerId, followingId } = args;

    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existingFollow = await ctx.db
      .query("follows")
      .withIndex("by_mutual", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .first();

    if (existingFollow) {
      throw new Error("Already following this user");
    }

    // Create follow relationship
    await ctx.db.insert("follows", {
      followerId,
      followingId,
      createdAt: Date.now(),
    });

    // Update follower count for followed user
    const followedUser = await ctx.db.get(followingId);
    if (followedUser) {
      await ctx.db.patch(followingId, {
        followerCount: (followedUser.followerCount || 0) + 1,
      });
    }

    // Update following count for follower
    const followerUser = await ctx.db.get(followerId);
    if (followerUser) {
      await ctx.db.patch(followerId, {
        followingCount: (followerUser.followingCount || 0) + 1,
      });
    }

    return { success: true };
  },
});

export const unfollowUser = mutation({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { followerId, followingId } = args;

    // Find the follow relationship
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_mutual", (q) =>
        q.eq("followerId", followerId).eq("followingId", followingId)
      )
      .first();

    if (!follow) {
      throw new Error("Not following this user");
    }

    // Remove follow relationship
    await ctx.db.delete(follow._id);

    // Update follower count for followed user
    const followedUser = await ctx.db.get(followingId);
    if (followedUser) {
      await ctx.db.patch(followingId, {
        followerCount: Math.max(0, (followedUser.followerCount || 1) - 1),
      });
    }

    // Update following count for follower
    const followerUser = await ctx.db.get(followerId);
    if (followerUser) {
      await ctx.db.patch(followerId, {
        followingCount: Math.max(0, (followerUser.followingCount || 1) - 1),
      });
    }

    return { success: true };
  },
});

// Check if user is following another user
export const isFollowing = query({
  args: {
    followerId: v.id("users"),
    followingId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const follow = await ctx.db
      .query("follows")
      .withIndex("by_mutual", (q) =>
        q.eq("followerId", args.followerId).eq("followingId", args.followingId)
      )
      .first();

    return !!follow;
  },
});

// Training request functionality
export const sendTrainingRequest = mutation({
  args: {
    requesterId: v.id("users"),
    trainerId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { requesterId, trainerId, message } = args;

    if (requesterId === trainerId) {
      throw new Error("Cannot send training request to yourself");
    }

    // Check if trainer is an individual with training enabled
    const trainer = await ctx.db.get(trainerId);
    if (!trainer || trainer.userType !== "individual") {
      throw new Error("User is not a trainer");
    }

    const trainerProfile = await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", trainerId))
      .first();

    if (!trainerProfile || !trainerProfile.isTrainingEnabled) {
      throw new Error("User does not offer training services");
    }

    // Check if request already exists
    const existingRequest = await ctx.db
      .query("trainingRequests")
      .withIndex("by_requester_trainer", (q) =>
        q.eq("requesterId", requesterId).eq("trainerId", trainerId)
      )
      .first();

    if (existingRequest) {
      throw new Error("Training request already sent");
    }

    // Create training request
    const requestId = await ctx.db.insert("trainingRequests", {
      requesterId,
      trainerId,
      message: message || "",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, requestId };
  },
});

// Check if training request exists
export const hasTrainingRequest = query({
  args: {
    requesterId: v.id("users"),
    trainerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("trainingRequests")
      .withIndex("by_requester_trainer", (q) =>
        q.eq("requesterId", args.requesterId).eq("trainerId", args.trainerId)
      )
      .first();

    return request ? request.status : null;
  },
});

// Get training requests for a trainer
export const getTrainingRequests = query({
  args: {
    trainerId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected")
      )
    ),
  },
  handler: async (ctx, args) => {
    let requestsQuery = ctx.db
      .query("trainingRequests")
      .withIndex("by_trainer", (q) => q.eq("trainerId", args.trainerId));

    if (args.status) {
      requestsQuery = requestsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const requests = await requestsQuery.collect();

    // Get requester information
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        return {
          ...request,
          requester,
        };
      })
    );

    return requestsWithUsers;
  },
});

// Update training request status
export const updateTrainingRequestStatus = mutation({
  args: {
    requestId: v.id("trainingRequests"),
    status: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Training request not found");
    }

    await ctx.db.patch(args.requestId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
