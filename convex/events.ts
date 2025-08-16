import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Create a new event
export const createEvent = mutation({
  args: {
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),
    date: v.number(),
    endDate: v.optional(v.number()),
    location: v.optional(
      v.object({
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        country: v.optional(v.string()),
        coordinates: v.optional(
          v.object({
            latitude: v.number(),
            longitude: v.number(),
          })
        ),
      })
    ),
    maxParticipants: v.optional(v.number()),
    eventType: v.union(
      v.literal("workout"),
      v.literal("competition"),
      v.literal("meetup"),
      v.literal("seminar")
    ),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Verify creator exists
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) {
      throw new Error("Creator not found");
    }

    // All user types can now create events

    const eventId = await ctx.db.insert("events", {
      ...args,
      rsvpCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return eventId;
  },
});

// Get events created by current user
export const getMyEvents = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .collect();

    // Get creator details for each event
    const eventsWithCreator = await Promise.all(
      events.map(async (event) => {
        const creator = await ctx.db.get(event.creatorId);
        return {
          ...event,
          creator,
        };
      })
    );

    return eventsWithCreator;
  },
});

// Get events user has participated in (RSVP'd to)
export const getUserParticipatedEvents = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    // Get all RSVPs for this user
    const userRsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Filter for events where user is going or maybe
    const participatingRsvps = userRsvps.filter(
      rsvp => rsvp.status === "going" || rsvp.status === "maybe"
    );
    
    // Get event details for each RSVP
    const eventsWithDetails = await Promise.all(
      participatingRsvps.slice(0, limit).map(async (rsvp) => {
        const event = await ctx.db.get(rsvp.eventId);
        if (!event) return null;
        
        const creator = await ctx.db.get(event.creatorId);
        
        // Get creator's profile for location info
        let creatorProfile = null;
        if (creator) {
          switch (creator.userType) {
            case "gym":
              creatorProfile = await ctx.db
                .query("gyms")
                .withIndex("by_user", (q) => q.eq("userId", creator._id))
                .first();
              break;
            case "brand":
              creatorProfile = await ctx.db
                .query("brands")
                .withIndex("by_user", (q) => q.eq("userId", creator._id))
                .first();
              break;
          }
        }
        
        return {
          ...event,
          creator: creator
            ? {
                ...creator,
                profile: creatorProfile,
              }
            : null,
          userRsvpStatus: rsvp.status,
        };
      })
    );
    
    // Filter out null events and sort by date
    return eventsWithDetails
      .filter((event) => event !== null)
      .sort((a, b) => b.date - a.date);
  },
});

// Get nearby public events
export const getNearbyEvents = query({
  args: {
    limit: v.optional(v.number()),
    userLocation: v.optional(
      v.object({
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        country: v.optional(v.string()),
        coordinates: v.optional(
          v.object({
            latitude: v.number(),
            longitude: v.number(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // Get all public events, ordered by date
    const events = await ctx.db
      .query("events")
      .withIndex("by_public_events", (q) => q.eq("isPublic", true))
      .order("desc")
      .take(limit);

    // Get creator details and user location for each event
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        const creator = await ctx.db.get(event.creatorId);

        // Get creator's profile for location info
        let creatorProfile = null;
        if (creator) {
          switch (creator.userType) {
            case "gym":
              creatorProfile = await ctx.db
                .query("gyms")
                .withIndex("by_user", (q) => q.eq("userId", creator._id))
                .first();
              break;
            case "brand":
              creatorProfile = await ctx.db
                .query("brands")
                .withIndex("by_user", (q) => q.eq("userId", creator._id))
                .first();
              break;
          }
        }

        return {
          ...event,
          creator: creator
            ? {
                ...creator,
                profile: creatorProfile,
              }
            : null,
        };
      })
    );

    // Filter out events without creators
    return eventsWithDetails.filter((event) => event.creator !== null);
  },
});

// Get event by ID with full details
export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const creator = await ctx.db.get(event.creatorId);

    // Get creator's profile
    let creatorProfile = null;
    if (creator) {
      switch (creator.userType) {
        case "gym":
          creatorProfile = await ctx.db
            .query("gyms")
            .withIndex("by_user", (q) => q.eq("userId", creator._id))
            .first();
          break;
        case "brand":
          creatorProfile = await ctx.db
            .query("brands")
            .withIndex("by_user", (q) => q.eq("userId", creator._id))
            .first();
          break;
      }
    }

    // Get RSVPs for this event
    const rsvps = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      ...event,
      creator: creator
        ? {
            ...creator,
            profile: creatorProfile,
          }
        : null,
      rsvps,
    };
  },
});

// RSVP to an event
export const rsvpToEvent = mutation({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(
      v.literal("going"),
      v.literal("maybe"),
      v.literal("not_going")
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already has an RSVP for this event
    const existingRsvp = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    if (existingRsvp) {
      // Update existing RSVP
      await ctx.db.patch(existingRsvp._id, {
        status: args.status,
      });
    } else {
      // Create new RSVP
      await ctx.db.insert("eventRSVPs", {
        eventId: args.eventId,
        userId: args.userId,
        status: args.status,
        createdAt: Date.now(),
      });
    }

    // Update event RSVP count
    const event = await ctx.db.get(args.eventId);
    if (event) {
      const allRsvps = await ctx.db
        .query("eventRSVPs")
        .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
        .collect();

      const goingCount = allRsvps.filter(
        (rsvp) => rsvp.status === "going"
      ).length;

      await ctx.db.patch(args.eventId, {
        rsvpCount: goingCount,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// Check user's RSVP status for an event
export const getUserRsvpStatus = query({
  args: {
    eventId: v.id("events"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const rsvp = await ctx.db
      .query("eventRSVPs")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", args.userId)
      )
      .first();

    return rsvp?.status || null;
  },
});
