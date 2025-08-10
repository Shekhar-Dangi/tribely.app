import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create brand profile
export const createBrandProfile = mutation({
  args: {
    userId: v.id("users"),
    businessInfo: v.object({
      industry: v.optional(v.string()),
      website: v.optional(v.string()),
      headquarters: v.optional(v.string()),
      contactInfo: v.optional(
        v.object({
          phone: v.optional(v.string()),
          email: v.optional(v.string()),
          address: v.optional(v.string()),
        })
      ),
    }),
    partnerships: v.optional(
      v.array(
        v.object({
          partnerName: v.string(),
          partnerType: v.union(
            v.literal("gym"),
            v.literal("individual"),
            v.literal("brand")
          ),
          partnership_type: v.string(),
          startDate: v.number(),
          endDate: v.optional(v.number()),
          isActive: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...profileData } = args;

    // Check if user exists and is of type brand
    const user = await ctx.db.get(userId);
    if (!user || user.userType !== "brand") {
      throw new Error("User not found or not a brand user");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("brands")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      throw new Error("Brand profile already exists for this user");
    }

    const profileId = await ctx.db.insert("brands", {
      userId,
      businessInfo: profileData.businessInfo,
      partnerships: profileData.partnerships,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return profileId;
  },
});

// Update brand profile
export const updateBrandProfile = mutation({
  args: {
    userId: v.id("users"),
    businessInfo: v.optional(
      v.object({
        industry: v.optional(v.string()),
        website: v.optional(v.string()),
        headquarters: v.optional(v.string()),
        contactInfo: v.optional(
          v.object({
            phone: v.optional(v.string()),
            email: v.optional(v.string()),
            address: v.optional(v.string()),
          })
        ),
      })
    ),
    partnerships: v.optional(
      v.array(
        v.object({
          partnerName: v.string(),
          partnerType: v.union(
            v.literal("gym"),
            v.literal("individual"),
            v.literal("brand")
          ),
          partnership_type: v.string(),
          startDate: v.number(),
          endDate: v.optional(v.number()),
          isActive: v.boolean(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    const profile = await ctx.db
      .query("brands")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) {
      throw new Error("Brand profile not found");
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

// Get brand profile
export const getBrandProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("brands")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

// Get brands by industry
export const getBrandsByIndustry = query({
  args: {
    industry: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let brands;
    if (args.industry) {
      brands = await ctx.db
        .query("brands")
        .withIndex("by_industry", (q) =>
          q.eq("businessInfo.industry", args.industry)
        )
        .take(limit);
    } else {
      brands = await ctx.db.query("brands").take(limit);
    }

    // Get the corresponding user data
    const results = await Promise.all(
      brands.map(async (brand) => {
        const user = await ctx.db.get(brand.userId);
        return {
          ...brand,
          user,
        };
      })
    );

    return results.filter((result) => result.user !== null);
  },
});

// Get all brands with their user data
export const getAllBrands = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const brands = await ctx.db.query("brands").take(limit);

    // Get the corresponding user data
    const results = await Promise.all(
      brands.map(async (brand) => {
        const user = await ctx.db.get(brand.userId);
        return {
          ...brand,
          user,
        };
      })
    );

    return results.filter((result) => result.user !== null);
  },
});

// Add partnership
export const addPartnership = mutation({
  args: {
    userId: v.id("users"),
    partnerName: v.string(),
    partnerType: v.union(
      v.literal("gym"),
      v.literal("individual"),
      v.literal("brand")
    ),
    partnership_type: v.string(),
    startDate: v.number(),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("brands")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!profile) {
      throw new Error("Brand profile not found");
    }

    const newPartnership = {
      partnerName: args.partnerName,
      partnerType: args.partnerType,
      partnership_type: args.partnership_type,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
    };

    const updatedPartnerships = [
      ...(profile.partnerships || []),
      newPartnership,
    ];

    await ctx.db.patch(profile._id, {
      partnerships: updatedPartnerships,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
