import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create individual profile
export const createIndividualProfile = mutation({
  args: {
    userId: v.id("users"),
    stats: v.optional(
      v.object({
        height: v.number(),
        weight: v.number(),
        bodyFat: v.optional(v.number()),
        personalRecords: v.optional(
          v.array(
            v.object({
              exerciseName: v.string(),
              subtitle: v.string(),
              date: v.number(),
            })
          )
        ),
      })
    ),
    experiences: v.optional(
      v.array(
        v.object({
          title: v.string(),
          subtitle: v.optional(v.string()),
          description: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          startDate: v.number(),
          endDate: v.optional(v.number()),
          isCurrent: v.boolean(),
        })
      )
    ),
    certifications: v.optional(
      v.array(
        v.object({
          title: v.string(),
          subtitle: v.optional(v.string()),
          description: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          issueDate: v.number(),
          expiryDate: v.optional(v.number()),
          credentialId: v.optional(v.string()),
          isActive: v.boolean(),
        })
      )
    ),
    affiliation: v.optional(v.string()),
    isTrainingEnabled: v.optional(v.boolean()),
    trainingPrice: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    // Check if user exists and is of type individual
    const user = await ctx.db.get(userId);
    if (!user || user.userType !== "individual") {
      throw new Error("User not found or not an individual user");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Individual profile already exists for this user");
    }

    const profileId = await ctx.db.insert("individuals", {
      userId,
      stats: profileData.stats,
      experiences: profileData.experiences,
      certifications: profileData.certifications,
      affiliation: profileData.affiliation,
      isTrainingEnabled: profileData.isTrainingEnabled || false,
      trainingPrice: profileData.trainingPrice,
      activityScore: 0,
      lastActivityUpdate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return profileId;
  },
});

// Update individual profile
export const updateIndividualProfile = mutation({
  args: {
    userId: v.id("users"),
    stats: v.optional(
      v.object({
        height: v.number(),
        weight: v.number(),
        bodyFat: v.optional(v.number()),
        personalRecords: v.optional(
          v.array(
            v.object({
              exerciseName: v.string(),
              subtitle: v.string(),
              date: v.number(),
            })
          )
        ),
      })
    ),
    experiences: v.optional(
      v.array(
        v.object({
          title: v.string(),
          subtitle: v.optional(v.string()),
          description: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          startDate: v.number(),
          endDate: v.optional(v.number()),
          isCurrent: v.boolean(),
        })
      )
    ),
    certifications: v.optional(
      v.array(
        v.object({
          title: v.string(),
          subtitle: v.optional(v.string()),
          description: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          issueDate: v.number(),
          expiryDate: v.optional(v.number()),
          credentialId: v.optional(v.string()),
          isActive: v.boolean(),
        })
      )
    ),
    affiliation: v.optional(v.string()),
    isTrainingEnabled: v.optional(v.boolean()),
    trainingPrice: v.optional(v.number()),
    activityScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const profile = await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Individual profile not found");
    }

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    await ctx.db.patch(profile._id, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Get individual profile
export const getIndividualProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Update activity score (for leaderboard)
export const updateActivityScore = mutation({
  args: {
    userId: v.id("users"),
    scoreChange: v.number(), // positive or negative change
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("individuals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Individual profile not found");
    }

    const newScore = Math.max(0, profile.activityScore + args.scoreChange);

    await ctx.db.patch(profile._id, {
      activityScore: newScore,
      lastActivityUpdate: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true, newScore };
  },
});

// Get top individuals by activity score (for leaderboard)
export const getTopIndividuals = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    const individuals = await ctx.db
      .query("individuals")
      .withIndex("by_activity_score")
      .order("desc")
      .take(limit);

    // Get the corresponding user data
    const results = await Promise.all(
      individuals.map(async (individual) => {
        const user = await ctx.db.get(individual.userId);
        return {
          ...individual,
          user,
        };
      })
    );

    return results.filter((result) => result.user !== null);
  },
});

// Get trainers (individuals with training enabled)
export const getTrainers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const trainers = await ctx.db
      .query("individuals")
      .withIndex("by_training_enabled", (q) => q.eq("isTrainingEnabled", true))
      .take(limit);

    // Get the corresponding user data
    const results = await Promise.all(
      trainers.map(async (trainer) => {
        const user = await ctx.db.get(trainer.userId);
        return {
          ...trainer,
          user,
        };
      })
    );

    return results.filter((result) => result.user !== null);
  },
});
