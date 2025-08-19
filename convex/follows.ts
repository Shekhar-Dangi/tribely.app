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

    // Check if trainer is an individual
    const trainer = await ctx.db.get(trainerId);
    if (!trainer || trainer.userType !== "individual") {
      throw new Error("Training requests can only be sent to individual users");
    }

    // Check if request already exists from requester to trainer
    const existingRequest = await ctx.db
      .query("trainingRequests")
      .withIndex("by_requester_trainer", (q) =>
        q.eq("requesterId", requesterId).eq("trainerId", trainerId)
      )
      .first();

    if (existingRequest) {
      // Allow re-sending if previous request was rejected or completed
      if (existingRequest.status === "pending" || existingRequest.status === "accepted") {
        throw new Error("Training request already exists");
      }
      // Delete old rejected/completed request to create new one
      await ctx.db.delete(existingRequest._id);
    }

    // Check for bidirectional request (trainer already sent request to requester)
    const reverseRequest = await ctx.db
      .query("trainingRequests")
      .withIndex("by_requester_trainer", (q) =>
        q.eq("requesterId", trainerId).eq("trainerId", requesterId)
      )
      .first();

    if (reverseRequest && reverseRequest.status === "pending") {
      // Auto-accept both directions
      await ctx.db.patch(reverseRequest._id, {
        status: "accepted",
        updatedAt: Date.now(),
      });

      // Create training request in opposite direction as accepted
      const requestId = await ctx.db.insert("trainingRequests", {
        requesterId,
        trainerId,
        message: message || "",
        status: "accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create chat for both users
      const userAChats = await ctx.db
        .query("chatUsers")
        .withIndex("by_user_id", (q) => q.eq("userId", requesterId))
        .collect();
      const chatIdsA = userAChats.map((cu) => cu.chatId);

      const userBChats = await ctx.db
        .query("chatUsers")
        .withIndex("by_user_id", (q) => q.eq("userId", trainerId))
        .collect();
      const chatIdsB = userBChats.map((cu) => cu.chatId);

      let chatId = chatIdsA.find((id) => chatIdsB.includes(id));

      if (!chatId) {
        chatId = await ctx.db.insert("chats", {
          lastMessageAt: Date.now(),
          isActive: true,
          creationReason: "train_request",
          createdAt: Date.now(),
        });

        await ctx.db.insert("chatUsers", {
          userId: requesterId,
          chatId: chatId,
        });
        await ctx.db.insert("chatUsers", {
          userId: trainerId,
          chatId: chatId,
        });
      }

      // Create system message
      const requester = await ctx.db.get(requesterId);
      await ctx.db.insert("messages", {
        chatId,
        senderId: trainerId,
        content: `You and @${requester?.username} have agreed to train together!`,
        readBy: [],
        isDeleted: false,
        isEdited: false,
        isSystemMessage: true,
        systemMessageType: "training_accepted",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update chat metadata
      await ctx.db.patch(chatId, {
        lastMessageAt: Date.now(),
        lastMessagePreview: "Training partnership started",
      });

      // Create notifications for both users
      await ctx.db.insert("notifications", {
        userId: requesterId,
        type: "train_accepted",
        title: "Training Request Auto-Accepted",
        body: `You and @${trainer.username} both wanted to train together!`,
        relatedUserId: trainerId,
        isRead: false,
        isPushed: false,
        createdAt: Date.now(),
      });

      await ctx.db.insert("notifications", {
        userId: trainerId,
        type: "train_accepted",
        title: "Training Request Auto-Accepted",
        body: `You and @${requester?.username} both wanted to train together!`,
        relatedUserId: requesterId,
        isRead: false,
        isPushed: false,
        createdAt: Date.now(),
      });

      return { success: true, requestId, autoAccepted: true, chatId };
    }

    // Create normal pending training request
    const requestId = await ctx.db.insert("trainingRequests", {
      requesterId,
      trainerId,
      message: message || "",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, requestId, autoAccepted: false };
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

// Get sent training requests
export const getSentTrainingRequests = query({
  args: {
    requesterId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
        v.literal("completed")
      )
    ),
  },
  handler: async (ctx, args) => {
    let requestsQuery = ctx.db
      .query("trainingRequests")
      .withIndex("by_requester", (q) => q.eq("requesterId", args.requesterId));

    if (args.status) {
      requestsQuery = requestsQuery.filter((q) =>
        q.eq(q.field("status"), args.status)
      );
    }

    const requests = await requestsQuery.collect();

    // Get trainer information
    const requestsWithUsers = await Promise.all(
      requests.map(async (request) => {
        const trainer = await ctx.db.get(request.trainerId);
        return {
          ...request,
          trainer: trainer ? {
            _id: trainer._id,
            username: trainer.username,
            avatarUrl: trainer.avatarUrl,
            bio: trainer.bio,
            isVerified: trainer.isVerified,
          } : null,
        };
      })
    );

    return requestsWithUsers;
  },
});

// Get received training requests
export const getReceivedTrainingRequests = query({
  args: {
    trainerId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
        v.literal("completed")
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
          requester: requester ? {
            _id: requester._id,
            username: requester.username,
            avatarUrl: requester.avatarUrl,
            bio: requester.bio,
            isVerified: requester.isVerified,
          } : null,
        };
      })
    );

    return requestsWithUsers;
  },
});

// Accept training request
export const acceptTrainingRequest = mutation({
  args: {
    requestId: v.id("trainingRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Training request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: "accepted",
      updatedAt: Date.now(),
    });

    // Get both users
    const requester = await ctx.db.get(request.requesterId);
    const trainer = await ctx.db.get(request.trainerId);

    if (!requester || !trainer) {
      throw new Error("Users not found");
    }

    // Create or get chat between users
    // First check if chat already exists
    const userAChats = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", request.requesterId))
      .collect();
    const chatIdsA = userAChats.map((cu) => cu.chatId);

    const userBChats = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", request.trainerId))
      .collect();
    const chatIdsB = userBChats.map((cu) => cu.chatId);

    let chatId = chatIdsA.find((id) => chatIdsB.includes(id));

    if (!chatId) {
      // Create new chat
      chatId = await ctx.db.insert("chats", {
        lastMessageAt: Date.now(),
        isActive: true,
        creationReason: "train_request",
        // Note: relatedRequestId expects trainRequests table ID, but we have trainingRequests
        // This is a schema inconsistency that should be fixed, but for now we'll omit it
        createdAt: Date.now(),
      });

      await ctx.db.insert("chatUsers", {
        userId: request.requesterId,
        chatId: chatId,
      });
      await ctx.db.insert("chatUsers", {
        userId: request.trainerId,
        chatId: chatId,
      });
    }

    // Create system message
    await ctx.db.insert("messages", {
      chatId,
      senderId: request.trainerId, // System message from trainer's perspective
      content: `You and @${requester.username} have agreed to train together!`,
      readBy: [],
      isDeleted: false,
      isEdited: false,
      isSystemMessage: true,
      systemMessageType: "training_accepted",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update chat metadata
    await ctx.db.patch(chatId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: "Training partnership started",
    });

    // Create notification for requester
    await ctx.db.insert("notifications", {
      userId: request.requesterId,
      type: "train_accepted",
      title: "Training Request Accepted",
      body: `@${trainer.username} accepted your training request!`,
      relatedUserId: request.trainerId,
      // Note: relatedRequestId expects trainRequests table ID, but we have trainingRequests
      // This is a schema inconsistency that should be fixed, but for now we'll omit it
      isRead: false,
      isPushed: false,
      createdAt: Date.now(),
    });

    return { success: true, chatId };
  },
});

// Reject training request
export const rejectTrainingRequest = mutation({
  args: {
    requestId: v.id("trainingRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Training request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Request is not pending");
    }

    await ctx.db.patch(args.requestId, {
      status: "rejected",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Cancel/Withdraw training request
export const cancelTrainingRequest = mutation({
  args: {
    requestId: v.id("trainingRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Training request not found");
    }

    if (request.status !== "pending") {
      throw new Error("Only pending requests can be cancelled");
    }

    // Delete the request
    await ctx.db.delete(args.requestId);

    return { success: true };
  },
});

// Mark training as complete
export const markTrainingComplete = mutation({
  args: {
    requestId: v.id("trainingRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Training request not found");
    }

    if (request.status !== "accepted") {
      throw new Error("Only accepted training requests can be marked as complete");
    }

    // Update status to completed
    await ctx.db.patch(args.requestId, {
      status: "completed",
      updatedAt: Date.now(),
    });

    // Get both users
    const requester = await ctx.db.get(request.requesterId);
    const trainer = await ctx.db.get(request.trainerId);

    // Find existing chat
    const userAChats = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", request.requesterId))
      .collect();
    const chatIdsA = userAChats.map((cu) => cu.chatId);

    const userBChats = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", request.trainerId))
      .collect();
    const chatIdsB = userBChats.map((cu) => cu.chatId);

    const chatId = chatIdsA.find((id) => chatIdsB.includes(id));

    if (chatId) {
      // Add completion message to chat
      await ctx.db.insert("messages", {
        chatId,
        senderId: request.trainerId,
        content: `✅ Training session completed with @${requester?.username}!`,
        readBy: [],
        isDeleted: false,
        isEdited: false,
        isSystemMessage: true,
        systemMessageType: "training_completed",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update chat metadata
      await ctx.db.patch(chatId, {
        lastMessageAt: Date.now(),
        lastMessagePreview: "Training session completed",
      });
    }

    return { success: true };
  },
});

// Get the most recent training request between two users
export const getMostRecentTrainingRequest = query({
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
      .order("desc")
      .first();

      const secondRequest = await ctx.db
      .query("trainingRequests")
      .withIndex("by_requester_trainer", (q) =>
        q.eq("requesterId", args.trainerId).eq("trainerId", args.requesterId)
      )
      .order("desc")
      .first();

    return request ? request : secondRequest;
  },
});

// Get training requests for a trainer (legacy - kept for compatibility)
export const getTrainingRequests = query({
  args: {
    trainerId: v.id("users"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("rejected"),
        v.literal("completed")
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

// Update training request status (legacy - kept for compatibility)
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
