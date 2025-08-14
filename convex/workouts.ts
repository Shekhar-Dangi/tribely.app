import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { calculateActivityScore } from "../utils/activityScore";
import { paginationOptsValidator } from "convex/server";

export const logTextWorkout = mutation({
  args: {
    userId: v.id("users"),
    resistanceDetails: v.optional(
      v.array(
        v.object({
          exercise: v.string(),
          sets: v.number(),
          reps: v.array(v.number()),
          weight: v.array(v.number()),
        })
      )
    ),
    cardioDetails: v.optional(
      v.array(
        v.object({
          type: v.string(),
          distance: v.optional(v.number()),
          duration: v.optional(v.number()),
        })
      )
    ),
    mobilityDetails: v.optional(
      v.array(
        v.object({
          type: v.string(),
          duration: v.number(),
        })
      )
    ),
    isEdited: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "individual") {
      throw new Error("User not found or not an individual user");
    }
    const individualProfile = await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!individualProfile) {
      throw new Error("Individual profile not found");
    }
    if (
      !(args.resistanceDetails || args.cardioDetails || args.mobilityDetails)
    ) {
      throw new Error("No Valid Data");
    }
    const workoutId = await ctx.db.insert("workouts", {
      userId: args.userId,
      resistanceDetails: args.resistanceDetails,
      mobilityDetails: args.mobilityDetails,
      cardioDetails: args.cardioDetails,
      createdAt: Date.now(),
      creditsUsed: 0,
      isProcessed: true,
    });

    const score = calculateActivityScore({
      resistanceDetails: args.resistanceDetails,
      mobilityDetails: args.mobilityDetails,
      cardioDetails: args.cardioDetails,
    });

    await ctx.db.patch(individualProfile._id, {
      activityScore: (individualProfile.activityScore || 0) + score,
      lastActivityUpdate: Date.now(),
    });
    // Log activity transaction
    await ctx.db.insert("activityTransactions", {
      userId: args.userId,
      activityType: "workout_posted",
      pointsEarned: score,
      description: "Posted a workout log",
      relatedId: workoutId,
      createdAt: Date.now(),
    });

    return { workoutId, score };
  },
});

export const getRecentLogs = query({
  args: {
    userId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || user.userType !== "individual") {
      throw new Error("User not found or not an individual user");
    }
    return await ctx.db
      .query("workouts")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .paginate(args.paginationOpts);
  },
});
