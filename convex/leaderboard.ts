import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get leaderboard based on activity score
export const getLeaderboard = query({
  args: {
    limit: v.optional(v.number()), // default to top 20
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // Get individuals sorted by activity score (descending)
    const individuals = await ctx.db
      .query("individuals")
      .withIndex("by_activity_score")
      .order("desc")
      .take(limit);

    // Enrich with user data
    const enrichedUsers = await Promise.all(
      individuals.map(async (individual) => {
        const user = await ctx.db.get(individual.userId);
        return user
          ? {
              ...user,
              activityScore: individual.activityScore,
              profile: individual,
            }
          : null;
      })
    );

    return enrichedUsers.filter((user) => user !== null);
  },
});

// Get user's ranking position
export const getUserRanking = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get the user's individual profile
    const userIndividual = await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!userIndividual) {
      return null; // User is not an individual (might be gym or brand)
    }
    
    // Get all individuals sorted by activity score
    const allIndividuals = await ctx.db
      .query("individuals")
      .withIndex("by_activity_score")
      .order("desc")
      .collect();
    
    // Find the user's position
    const userPosition = allIndividuals.findIndex(
      (individual) => individual.userId === args.userId
    );
    
    if (userPosition === -1) {
      return null;
    }
    
    return {
      position: userPosition + 1, // Convert from 0-indexed to 1-indexed
      totalUsers: allIndividuals.length,
      activityScore: userIndividual.activityScore,
    };
  },
});

// Get recent activity transactions for all users (activity feed)
export const getRecentActivityFeed = query({
  args: {
    limit: v.optional(v.number()), // default to 50
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Get recent activity transactions
    const transactions = await ctx.db
      .query("activityTransactions")
      .withIndex("by_recent")
      .order("desc")
      .take(limit);

    // Enrich with user data
    const enrichedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const user = await ctx.db.get(transaction.userId);
        return {
          ...transaction,
          user: user
            ? {
                username: user.username,
                avatarUrl: user.avatarUrl,
                userType: user.userType,
                isVerified: user.isVerified,
              }
            : null,
        };
      })
    );

    return enrichedTransactions.filter((t) => t.user !== null);
  },
});

// Add activity transaction (when user does something)
export const addActivityTransaction = mutation({
  args: {
    userId: v.id("users"),
    activityType: v.union(
      v.literal("workout_posted"),
      v.literal("event_created"),
      v.literal("event_joined"),
      v.literal("follower_gained"),
      v.literal("profile_completed"),
      v.literal("weekly_streak"),
      v.literal("monthly_milestone"),
      v.literal("community_interaction"),
      v.literal("achievement_unlocked"),
      v.literal("manual_adjustment")
    ),
    pointsEarned: v.number(),
    description: v.string(),
    relatedId: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        eventName: v.optional(v.string()),
        workoutType: v.optional(v.string()),
        achievementName: v.optional(v.string()),
        streakDays: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Add the transaction
    const transactionId = await ctx.db.insert("activityTransactions", {
      ...args,
      createdAt: Date.now(),
    });

    // Update individual's activity score (only for individuals)
    const user = await ctx.db.get(args.userId);
    if (user && user.userType === "individual") {
      const individual = await ctx.db
        .query("individuals")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .first();

      if (individual) {
        const newActivityScore =
          (individual.activityScore || 0) + args.pointsEarned;
        await ctx.db.patch(individual._id, {
          activityScore: Math.max(0, newActivityScore), // Don't go below 0
          lastActivityUpdate: Date.now(),
        });
      }
    }

    return transactionId;
  },
});

// Get user's activity history
export const getUserActivityHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const transactions = await ctx.db
      .query("activityTransactions")
      .withIndex("by_user")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .take(limit);

    return transactions;
  },
});
