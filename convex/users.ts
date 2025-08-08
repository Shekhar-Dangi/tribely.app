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
      userType: "individual", // default type, will be updated during onboarding
      socialLinks: undefined,
      isVerified: false,
      isPremium: false,
      followerCount: 0,
      followingCount: 0,
      onBoardingStatus: false, // User needs to complete onboarding
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

// Get user with profile by clerkId
export const getUserWithProfileByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) return null;

    let profileData = null;

    // Fetch specialized profile based on user type
    switch (user.userType) {
      case "individual":
        profileData = await ctx.db
          .query("individuals")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;

      case "gym":
        profileData = await ctx.db
          .query("gyms")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;

      case "brand":
        profileData = await ctx.db
          .query("brands")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;
    }

    return {
      ...user,
      profile: profileData,
    };
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
    userType: v.union(
      v.literal("individual"),
      v.literal("gym"),
      v.literal("brand")
    ),
    // Individual-specific data
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
    // Gym-specific data
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
    gymStats: v.optional(
      v.object({
        memberCount: v.number(),
        trainerCount: v.number(),
      })
    ),
    // Brand-specific data
    brandBusinessInfo: v.optional(
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
    // Common data
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Update base user record
    await ctx.db.patch(user._id, {
      onBoardingStatus: true,
      userType: args.userType,
      socialLinks: args.socialLinks,
      updatedAt: Date.now(),
    });

    // Create specialized profile based on user type
    if (args.userType === "individual") {
      await ctx.db.insert("individuals", {
        userId: user._id,
        stats: args.stats,
        experiences: args.experiences,
        certifications: args.certifications,
        affiliation: args.affiliation,
        isTrainingEnabled: args.isTrainingEnabled || false,
        trainingPrice: args.trainingPrice,
        activityScore: 0,
        lastActivityUpdate: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (args.userType === "gym") {
      await ctx.db.insert("gyms", {
        userId: user._id,
        businessInfo: args.businessInfo || {
          address: undefined,
          phone: undefined,
          website: undefined,
          operatingHours: undefined,
        },
        membershipPlans: args.membershipPlans,
        stats: args.gymStats,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (args.userType === "brand") {
      await ctx.db.insert("brands", {
        userId: user._id,
        businessInfo: args.brandBusinessInfo || {
          industry: undefined,
          website: undefined,
          headquarters: undefined,
          contactInfo: undefined,
        },
        partnerships: args.partnerships,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ──────── NEW FUNCTIONS FOR SPECIALIZED PROFILES ────────

// Get user with their specialized profile data
export const getUserWithProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    let profileData = null;

    // Fetch specialized profile based on user type
    switch (user.userType) {
      case "individual":
        profileData = await ctx.db
          .query("individuals")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();
        break;

      case "gym":
        profileData = await ctx.db
          .query("gyms")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();
        break;

      case "brand":
        profileData = await ctx.db
          .query("brands")
          .withIndex("by_user", (q) => q.eq("userId", args.userId))
          .first();
        break;
    }

    return {
      ...user,
      profile: profileData,
    };
  },
});

// Get user by username with profile
export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) return null;

    let profileData = null;
    switch (user.userType) {
      case "individual":
        profileData = await ctx.db
          .query("individuals")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;

      case "gym":
        profileData = await ctx.db
          .query("gyms")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;

      case "brand":
        profileData = await ctx.db
          .query("brands")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();
        break;
    }

    return {
      ...user,
      profile: profileData,
    };
  },
});

// Update base user information
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(cleanUpdates).length === 0) {
      throw new Error("No valid updates provided");
    }

    await ctx.db.patch(userId, {
      ...cleanUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Search users by username
export const searchUsers = query({
  args: {
    query: v.string(),
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let usersQuery = ctx.db.query("users");

    // Apply user type filter if specified
    if (args.userType) {
      usersQuery = usersQuery.filter((q) =>
        q.eq(q.field("userType"), args.userType)
      );
    }

    // Search by username (case-insensitive)
    const users = await usersQuery
      .filter((q) =>
        q.or(
          q.gte(q.field("username"), args.query.toLowerCase()),
          q.lte(q.field("username"), args.query.toLowerCase() + "~")
        )
      )
      .take(limit);

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profileData = null;

        switch (user.userType) {
          case "individual":
            profileData = await ctx.db
              .query("individuals")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;

          case "gym":
            profileData = await ctx.db
              .query("gyms")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;

          case "brand":
            profileData = await ctx.db
              .query("brands")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
        }

        return {
          ...user,
          profile: profileData,
        };
      })
    );

    return usersWithProfiles;
  },
});

// Get trending users (most active or most followed)
export const getTrendingUsers = query({
  args: {
    limit: v.optional(v.number()),
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    let usersQuery = ctx.db.query("users");

    // Apply user type filter if specified
    if (args.userType) {
      usersQuery = usersQuery.filter((q) =>
        q.eq(q.field("userType"), args.userType)
      );
    }

    // Order by follower count (trending)
    const users = await usersQuery.order("desc").take(limit * 2); // Take more to filter after profile fetch

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profileData = null;

        switch (user.userType) {
          case "individual":
            profileData = await ctx.db
              .query("individuals")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;

          case "gym":
            profileData = await ctx.db
              .query("gyms")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;

          case "brand":
            profileData = await ctx.db
              .query("brands")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
        }

        return {
          ...user,
          profile: profileData,
        };
      })
    );

    // Sort by follower count and limit results
    return usersWithProfiles
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, limit);
  },
});
