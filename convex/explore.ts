import { query } from "./_generated/server";
import { v } from "convex/values";

// Search users by username across all user types
export const searchUsers = query({
  args: {
    searchTerm: v.string(),
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { searchTerm, userType, city, state, limit = 20 } = args;

    let results = await ctx.db
      .query("users")
      .withSearchIndex("search_users", (q) => {
        let query = q.search("username", searchTerm);

        if (userType) {
          query = query.eq("userType", userType);
        }

        if (city) {
          query = query.eq("location.city", city);
        }

        if (state) {
          query = query.eq("location.state", state);
        }

        return query;
      })
      .take(limit);

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      results.map(async (user) => {
        let profile = null;

        switch (user.userType) {
          case "individual":
            profile = await ctx.db
              .query("individuals")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
          case "gym":
            profile = await ctx.db
              .query("gyms")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
          case "brand":
            profile = await ctx.db
              .query("brands")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
        }

        return { ...user, profile };
      })
    );

    return usersWithProfiles;
  },
});

// Get users by location for suggestions
export const getUsersByLocation = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),
    excludeUserId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { city, state, userType, excludeUserId, limit = 10 } = args;

    // Start with all users and filter
    let results = await ctx.db.query("users").collect();

    // Apply filters
    results = results.filter((user) => {
      if (excludeUserId && user._id === excludeUserId) return false;
      if (userType && user.userType !== userType) return false;
      if (city && user.location?.city !== city) return false;
      if (state && user.location?.state !== state) return false;
      return true;
    });

    // Limit results
    results = results.slice(0, limit);

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      results.map(async (user) => {
        let profile = null;

        switch (user.userType) {
          case "individual":
            profile = await ctx.db
              .query("individuals")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
          case "gym":
            profile = await ctx.db
              .query("gyms")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
          case "brand":
            profile = await ctx.db
              .query("brands")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
        }

        return { ...user, profile };
      })
    );

    return usersWithProfiles;
  },
});

// Get nearby individuals for suggestions
// this isn't scalable. will fix it soon.
export const getNearbyIndividuals = query({
  args: {
    coordinates: v.optional(
      v.object({ latitude: v.number(), longitude: v.number() })
    ),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    country: v.optional(v.string()),
    excludeUserId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const {
      coordinates,
      city,
      state,
      country,
      excludeUserId,
      limit = 10,
    } = args;

    let results: any[] = [];

    // 1. Coordinates available → fallback to country filter + haversine
    if (coordinates && country) {
      let candidates = await ctx.db
        .query("users")
        .withIndex("by_location_country", (q) =>
          q.eq("location.country", country)
        )
        .filter((q) => q.eq(q.field("userType"), "individual"))
        .collect();

      if (excludeUserId) {
        candidates = candidates.filter((u) => u._id !== excludeUserId);
      }

      results = candidates
      .filter((u) => u.location?.coordinates) 
      .map((u) => {
        const coords = u.location!.coordinates!; 
        const d = haversine(coordinates, coords);
        return { ...u, distance: d };
      })
      .sort((a, b) => a.distance - b.distance);
    } else {
      // 2. No coordinates → hierarchical fallback
      let candidates: any[] = [];

      if (city) {
        candidates = await ctx.db
          .query("users")
          .withIndex("by_location_city", (q) => q.eq("location.city", city))
          .filter((q) => q.eq(q.field("userType"), "individual"))
          .collect();
      }

      if (candidates.length < limit && state) {
        const stateUsers = await ctx.db
          .query("users")
          .withIndex("by_location_state", (q) => q.eq("location.state", state))
          .filter((q) => q.eq(q.field("userType"), "individual"))
          .collect();
        candidates.push(...stateUsers);
      }

      if (candidates.length < limit && country) {
        const countryUsers = await ctx.db
          .query("users")
          .withIndex("by_location_country", (q) =>
            q.eq("location.country", country)
          )
          .filter((q) => q.eq(q.field("userType"), "individual"))
          .collect();
        candidates.push(...countryUsers);
      }

      // Deduplicate + exclude
      const seen = new Set();
      results = candidates.filter((u) => {
        if (excludeUserId && u._id === excludeUserId) return false;
        if (seen.has(u._id)) return false;
        seen.add(u._id);
        return true;
      });
    }

    // 3. Apply limit and fetch profiles
    results = results.slice(0, limit);

    const usersWithProfiles = await Promise.all(
      results.map(async (user) => {
        const profile = await ctx.db
          .query("individuals")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        return { ...user, profile };
      })
    );

    return usersWithProfiles;
  },
});

// Haversine now works with { latitude, longitude }
function haversine(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(coord2.latitude - coord1.latitude);
  const dLon = toRad(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1.latitude)) *
      Math.cos(toRad(coord2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get nearby gyms for suggestions
export const getNearbyGyms = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    excludeUserId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { city, state, excludeUserId, limit = 10 } = args;

    // Start with all gym users and filter
    let results = await ctx.db.query("users").collect();

    // Apply filters
    results = results.filter((user) => {
      if (user.userType !== "gym") return false;
      if (excludeUserId && user._id === excludeUserId) return false;
      if (city && user.location?.city !== city) return false;
      if (state && user.location?.state !== state) return false;
      return true;
    });

    // Limit results
    results = results.slice(0, limit);

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      results.map(async (user) => {
        const profile = await ctx.db
          .query("gyms")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        return { ...user, profile };
      })
    );

    return usersWithProfiles;
  },
});

// Get nearby brands for suggestions
export const getNearbyBrands = query({
  args: {
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    excludeUserId: v.optional(v.id("users")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { city, state, excludeUserId, limit = 10 } = args;

    // Start with all brand users and filter
    let results = await ctx.db.query("users").collect();

    // Apply filters
    results = results.filter((user) => {
      if (user.userType !== "brand") return false;
      if (excludeUserId && user._id === excludeUserId) return false;
      if (city && user.location?.city !== city) return false;
      if (state && user.location?.state !== state) return false;
      return true;
    });

    // Limit results
    results = results.slice(0, limit);

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      results.map(async (user) => {
        const profile = await ctx.db
          .query("brands")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        return { ...user, profile };
      })
    );

    return usersWithProfiles;
  },
});

// Get all users with filters
export const getAllUsers = query({
  args: {
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),
    city: v.optional(v.string()),
    state: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { userType, city, state, limit = 20 } = args;

    let results = await ctx.db.query("users").order("desc").take(100);

    // Apply filters
    results = results.filter((user) => {
      if (userType && user.userType !== userType) return false;
      if (city && user.location?.city !== city) return false;
      if (state && user.location?.state !== state) return false;
      return true;
    });

    // Limit results
    results = results.slice(0, limit);

    // Get profiles for each user
    const usersWithProfiles = await Promise.all(
      results.map(async (user) => {
        let profile = null;

        switch (user.userType) {
          case "individual":
            profile = await ctx.db
              .query("individuals")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
          case "gym":
            profile = await ctx.db
              .query("gyms")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
          case "brand":
            profile = await ctx.db
              .query("brands")
              .withIndex("by_user", (q) => q.eq("userId", user._id))
              .first();
            break;
        }

        return { ...user, profile };
      })
    );

    return usersWithProfiles;
  },
});

// Get unique cities for location filter dropdown
export const getUniqueCities = query({
  args: {
    state: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { state } = args;

    const users = await ctx.db.query("users").collect();

    const cities = new Set<string>();

    users.forEach((user) => {
      if (user.location?.city) {
        if (!state || user.location.state === state) {
          cities.add(user.location.city);
        }
      }
    });

    return Array.from(cities).sort();
  },
});

// Get unique states for location filter dropdown
export const getUniqueStates = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const states = new Set<string>();

    users.forEach((user) => {
      if (user.location?.state) {
        states.add(user.location.state);
      }
    });

    return Array.from(states).sort();
  },
});
