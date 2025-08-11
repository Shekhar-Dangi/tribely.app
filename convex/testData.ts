import { mutation } from "./_generated/server";

// Test function to create sample events - remove this in production
export const createSampleEvents = mutation({
  args: {},
  handler: async (ctx) => {
    // First, find some gym or brand users to use as creators
    const gyms = await ctx.db
      .query("users")
      .withIndex("by_user_type", (q) => q.eq("userType", "gym"))
      .take(2);

    const brands = await ctx.db
      .query("users")
      .withIndex("by_user_type", (q) => q.eq("userType", "brand"))
      .take(2);

    const creators = [...gyms, ...brands];

    if (creators.length === 0) {
      throw new Error("No gym or brand users found to create sample events");
    }

    const sampleEvents = [
      {
        title: "Morning CrossFit Challenge",
        description:
          "Join us for an intense morning CrossFit session! Perfect for all fitness levels. We'll have certified trainers guiding you through various exercises including weightlifting, cardio, and functional movements. Bring water and a towel!",
        eventType: "workout" as const,
        location: "Downtown Fitness Center, 123 Main St",
        maxParticipants: 20,
        date: Date.now() + 2 * 24 * 60 * 60 * 1000, // 2 days from now
        endDate: Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000, // 2 hours later
      },
      {
        title: "Annual Fitness Competition",
        description:
          "Our biggest fitness competition of the year! Compete in various categories including powerlifting, endurance challenges, and team events. Prizes for top performers in each category. Registration includes a t-shirt and post-event meal.",
        eventType: "competition" as const,
        location: "Sports Complex Arena, 456 Sports Ave",
        maxParticipants: 100,
        date: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week from now
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000, // 6 hours later
      },
      {
        title: "Nutrition & Wellness Seminar",
        description:
          "Learn about proper nutrition, meal planning, and wellness strategies from certified nutritionists and fitness experts. This educational seminar covers macro counting, supplement guidance, and sustainable lifestyle changes. Q&A session included.",
        eventType: "seminar" as const,
        location: "Conference Room B, Wellness Center",
        maxParticipants: 50,
        date: Date.now() + 5 * 24 * 60 * 60 * 1000, // 5 days from now
        endDate: Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000, // 3 hours later
      },
      {
        title: "Community Fitness Meetup",
        description:
          "Casual outdoor fitness meetup for the community! We'll have group activities, friendly competitions, and networking opportunities. Perfect for meeting like-minded fitness enthusiasts in your area. All fitness levels welcome!",
        eventType: "meetup" as const,
        location: "Central Park, Pavilion Area",
        maxParticipants: 30,
        date: Date.now() + 3 * 24 * 60 * 60 * 1000, // 3 days from now
        endDate: Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000, // 2 hours later
      },
      {
        title: "HIIT Bootcamp Session",
        description:
          "High-intensity interval training bootcamp designed to push your limits! This session combines cardio bursts with strength training for maximum calorie burn and muscle building. Modifications available for all fitness levels.",
        eventType: "workout" as const,
        location: "Outdoor Training Ground, Riverside Park",
        maxParticipants: 25,
        date: Date.now() + 1 * 24 * 60 * 60 * 1000, // Tomorrow
        endDate: Date.now() + 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000, // 1 hour later
      },
    ];

    const createdEvents = [];
    for (let i = 0; i < sampleEvents.length && i < creators.length; i++) {
      const event = sampleEvents[i];
      const creator = creators[i % creators.length];

      const eventId = await ctx.db.insert("events", {
        creatorId: creator._id,
        title: event.title,
        description: event.description,
        date: event.date,
        endDate: event.endDate,
        location: event.location,
        maxParticipants: event.maxParticipants,
        eventType: event.eventType,
        isPublic: true,
        rsvpCount: Math.floor(Math.random() * (event.maxParticipants || 10)), // Random RSVP count
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      createdEvents.push(eventId);
    }

    return {
      success: true,
      createdCount: createdEvents.length,
      eventIds: createdEvents,
    };
  },
});
