import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existingUser) {
      console.log("User already exists:", args.clerkId);
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username:
        args.name.toLowerCase().replace(/\s+/g, "") || `user_${Date.now()}`,
      bio: undefined,
      avatarUrl: args.avatarUrl,
      stats: undefined,
      experiences: undefined,
      certifications: undefined,
      socialLinks: undefined,
      affiliation: undefined,
      activityScore: 0, // initial value for leaderboard
      isVerified: false,
      isPremium: false,
      followerCount: 0,
      followingCount: 0,
      onBoardingStatus: false, // User needs to complete onboarding
      isTrainingEnabled: false,
      trainingPrice: undefined,
      lastActivityUpdate: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log("Created new user:", userId);
    return userId;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const completeOnboarding = mutation({
  args: {
    clerkId: v.string(),
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),
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
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),
    affiliation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      onBoardingStatus: true,
      userType: args.userType,
      stats: args.stats,
      experiences: args.experiences,
      certifications: args.certifications,
      socialLinks: args.socialLinks,
      affiliation: args.affiliation,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
