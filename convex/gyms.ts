import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create gym profile
export const createGymProfile = mutation({
  args: {
    userId: v.id("users"),
    businessInfo: v.object({
      address: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),
      operatingHours: v.optional(
        v.object({
          monday: v.optional(v.string()),
          tuesday: v.optional(v.string()),
          wednesday: v.optional(v.string()),
          thursday: v.optional(v.string()),
          friday: v.optional(v.string()),
          saturday: v.optional(v.string()),
          sunday: v.optional(v.string()),
        })
      ),
    }),
    membershipPlans: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          duration: v.string(),
          features: v.array(v.string()),
        })
      )
    ),
    stats: v.optional(
      v.object({
        memberCount: v.number(),
        trainerCount: v.number(),
        equipmentCount: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    // Check if user exists and is of type gym
    const user = await ctx.db.get(userId);
    if (!user || user.userType !== "gym") {
      throw new Error("User not found or not a gym user");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("gyms")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Gym profile already exists for this user");
    }

    const profileId = await ctx.db.insert("gyms", {
      userId,
      businessInfo: profileData.businessInfo,
      membershipPlans: profileData.membershipPlans,
      stats: profileData.stats,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return profileId;
  },
});

// Update gym profile
export const updateGymProfile = mutation({
  args: {
    userId: v.id("users"),
    businessInfo: v.optional(
      v.object({
        address: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        operatingHours: v.optional(
          v.object({
            monday: v.optional(v.string()),
            tuesday: v.optional(v.string()),
            wednesday: v.optional(v.string()),
            thursday: v.optional(v.string()),
            friday: v.optional(v.string()),
            saturday: v.optional(v.string()),
            sunday: v.optional(v.string()),
          })
        ),
        amenities: v.optional(v.array(v.string())),
      })
    ),
    membershipPlans: v.optional(
      v.array(
        v.object({
          name: v.string(),
          price: v.number(),
          duration: v.string(),
          features: v.array(v.string()),
        })
      )
    ),
    stats: v.optional(
      v.object({
        memberCount: v.number(),
        trainerCount: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const profile = await ctx.db
      .query("gyms")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Gym profile not found");
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

// Get gym profile
export const getGymProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("gyms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Search gyms by location
export const searchGymsByLocation = query({
  args: {
    location: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let gyms;
    if (args.location) {
      // This is a simple search - in production you might want to use geographic search
      gyms = await ctx.db
        .query("gyms")
        .filter((q) =>
          q.and(
            q.neq(q.field("businessInfo.address"), undefined),
            // Simple text matching - enhance with proper geo search later
            q.or(
              q.eq(q.field("businessInfo.address"), args.location)
              // You could add more sophisticated location matching here
            )
          )
        )
        .take(limit);
    } else {
      gyms = await ctx.db.query("gyms").take(limit);
    }

    // Get the corresponding user data
    const results = await Promise.all(
      gyms.map(async (gym) => {
        const user = await ctx.db.get(gym.userId);
        return {
          ...gym,
          user,
        };
      })
    );

    return results.filter((result) => result.user !== null);
  },
});

// Get all gyms with their user data
export const getAllGyms = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const gyms = await ctx.db.query("gyms").take(limit);

    // Get the corresponding user data
    const results = await Promise.all(
      gyms.map(async (gym) => {
        const user = await ctx.db.get(gym.userId);
        return {
          ...gym,
          user,
        };
      })
    );

    return results.filter((result) => result.user !== null);
  },
});
