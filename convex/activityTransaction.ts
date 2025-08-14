import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const logActivityTransaction = mutation({
  args: {
    userId: v.id("users"),
    pointsEarned: v.number(),
    relatedId: v.string(),
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
      v.literal("manual_adjustment") // for admin adjustments
    ),
  },
  handler: async (ctx, args) => {
    // Save activity transaction
    await ctx.db.insert("activityTransactions", {
      userId: args.userId,
      pointsEarned: args.pointsEarned,
      activityType: args.activityType,
      relatedId: args.relatedId,
      createdAt: Date.now(),
    });
  },
});
