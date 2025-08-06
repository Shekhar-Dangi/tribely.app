import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ──────── USERS ────────
  users: defineTable({
    clerkId: v.string(),
    username: v.string(),
    email: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),

    // User type/category from onboarding
    userType: v.optional(
      v.union(v.literal("individual"), v.literal("gym"), v.literal("brand"))
    ),

    // Personal Stats
    stats: v.optional(
      v.object({
        height: v.number(), // in cm
        weight: v.number(), // in kg
        bodyFat: v.optional(v.number()), // percentage
        personalRecords: v.optional(
          v.array(
            v.object({
              exerciseName: v.string(), // "Bench Press", "5K Run", "Triceps Pushdown", etc.
              subtitle: v.string(),
              date: v.number(), // when this PR was achieved
            })
          )
        ),
      })
    ),

    // Professional Info & Life Experiences
    experiences: v.optional(
      v.array(
        v.object({
          title: v.string(), // "Personal Trainer", "Powerlifting Competitor", etc.
          subtitle: v.optional(v.string()), // "Gold's Gym", "State Championship", etc.
          description: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          startDate: v.number(),
          endDate: v.optional(v.number()), // null means current
          isCurrent: v.boolean(),
        })
      )
    ),
    certifications: v.optional(
      v.array(
        v.object({
          title: v.string(), // "NASM-CPT", "CrossFit Level 1", etc.
          subtitle: v.optional(v.string()), // "National Academy of Sports Medicine"
          description: v.optional(v.string()),
          logoUrl: v.optional(v.string()),
          issueDate: v.number(),
          expiryDate: v.optional(v.number()),
          credentialId: v.optional(v.string()),
          isActive: v.boolean(),
        })
      )
    ),
    affiliation: v.optional(v.string()), // gym or brand name

    // Social Links
    socialLinks: v.optional(
      v.object({
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        twitter: v.optional(v.string()),
      })
    ),

    // Account Status
    isPremium: v.boolean(),
    isVerified: v.boolean(), // premium badge
    followerCount: v.number(),
    followingCount: v.number(),
    onBoardingStatus: v.boolean(),

    // Activity Score for Leaderboard (calculated field)
    activityScore: v.number(),
    lastActivityUpdate: v.number(),

    // Settings
    isTrainingEnabled: v.boolean(),
    trainingPrice: v.optional(v.number()), // null means free

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_username", ["username"])
    .index("by_follower_count", ["followerCount"])
    .index("by_activity_score", ["activityScore"])
    .index("by_premium_status", ["isPremium"])
    .searchIndex("search_users", {
      searchField: "username",
      filterFields: ["affiliation", "isPremium", "isVerified", "experiences"],
    }),

  // ──────── POSTS ────────
  posts: defineTable({
    userId: v.id("users"),
    content: v.optional(v.string()),

    // Media
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
    mediaDuration: v.optional(v.number()), // for videos in seconds
    mediaQuality: v.optional(v.string()), // "720p", "1080p"

    // Privacy & Engagement
    privacy: v.union(
      v.literal("public"),
      v.literal("friends"),
      v.literal("private")
    ),
    likeCount: v.number(),
    commentCount: v.number(),

    // Tags
    tags: v.optional(v.array(v.string())),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_privacy", ["privacy"])
    .index("by_created_at", ["createdAt"])
    .index("by_user_and_privacy", ["userId", "privacy"])
    .index("by_public_posts", ["privacy", "createdAt"]),

  // ──────── POST INTERACTIONS ────────
  likes: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    createdAt: v.number(),
  })
    .index("by_post", ["postId"])
    .index("by_user", ["userId"])
    .index("by_user_and_post", ["userId", "postId"]),

  comments: defineTable({
    userId: v.id("users"),
    postId: v.id("posts"),
    content: v.string(),
    isDeleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_post", ["postId", "createdAt"])
    .index("by_user", ["userId"]),

  // ──────── WORKOUT LOGS ────────
  workouts: defineTable({
    userId: v.id("users"),

    // Voice Data
    audioUrl: v.optional(v.string()),
    transcription: v.optional(v.string()),
    summary: v.optional(v.string()), // AI-generated summary

    // Workout Details
    duration: v.number(), // in minutes
    intensity: v.optional(v.number()), // 1-10 scale
    workoutType: v.optional(v.string()), // "strength", "cardio", "flexibility", etc.
    exercises: v.optional(v.array(v.string())), // extracted from transcription

    // Metadata
    tags: v.optional(v.array(v.string())),
    creditsUsed: v.number(),
    isProcessed: v.boolean(), // AI processing status

    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "createdAt"])
    .index("by_processing_status", ["isProcessed"]),

  // ──────── CREDITS SYSTEM ────────
  credits: defineTable({
    userId: v.id("users"),
    total: v.number(),
    used: v.number(),
    available: v.number(), // total - used
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  creditTransactions: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("initial"), // starting credits
      v.literal("purchase"), // bought credits
      v.literal("earned"), // leaderboard rewards
      v.literal("used"), // workout logging
      v.literal("refund")
    ),
    amount: v.number(), // positive for earned/purchased, negative for used
    description: v.string(),
    relatedWorkoutId: v.optional(v.id("workouts")),
    relatedLeaderboardPeriod: v.optional(v.string()), // for earned credits
    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_type", ["type"]),

  // ──────── EVENTS ────────
  events: defineTable({
    creatorId: v.id("users"),
    title: v.string(),
    description: v.string(),

    // Event Details
    date: v.number(),
    endDate: v.optional(v.number()),
    location: v.optional(v.string()),
    maxParticipants: v.optional(v.number()),

    // Event Type & Privacy
    eventType: v.union(
      v.literal("workout"),
      v.literal("competition"),
      v.literal("meetup"),
      v.literal("seminar")
    ),
    isPublic: v.boolean(),

    // Engagement
    rsvpCount: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_creator", ["creatorId"])
    .index("by_date", ["date"])
    .index("by_public_events", ["isPublic", "date"])
    .index("by_event_type", ["eventType", "date"]),

  eventRSVPs: defineTable({
    eventId: v.id("events"),
    userId: v.id("users"),
    status: v.union(
      v.literal("going"),
      v.literal("maybe"),
      v.literal("not_going")
    ),
    createdAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"])
    .index("by_event_and_user", ["eventId", "userId"]),

  // ──────── TRAINING SYSTEM ────────
  trainRequests: defineTable({
    fromUserId: v.id("users"),
    toUserId: v.id("users"),

    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("cancelled"),
      v.literal("completed")
    ),

    // Payment & Scheduling
    pricePaid: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    duration: v.optional(v.number()), // in minutes

    // Communication
    message: v.optional(v.string()),
    location: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_trainer", ["toUserId", "status"])
    .index("by_trainee", ["fromUserId", "status"])
    .index("by_status", ["status"])
    .index("by_scheduled_date", ["scheduledAt"]),

  trainingSessions: defineTable({
    requestId: v.id("trainRequests"),
    trainerId: v.id("users"),
    traineeId: v.id("users"),

    scheduledAt: v.number(),
    actualStartTime: v.optional(v.number()),
    actualEndTime: v.optional(v.number()),

    status: v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),

    // Session Details
    notes: v.optional(v.string()),
    rating: v.optional(v.number()), // 1-5 stars
    feedback: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_trainer", ["trainerId", "scheduledAt"])
    .index("by_trainee", ["traineeId", "scheduledAt"])
    .index("by_status", ["status"]),

  // ──────── CHAT SYSTEM ────────
  chats: defineTable({
    userIds: v.array(v.id("users")), // always exactly 2 users

    // Chat Metadata
    lastMessageAt: v.number(),
    lastMessagePreview: v.optional(v.string()),
    isActive: v.boolean(),

    // Auto-creation context
    creationReason: v.union(
      v.literal("train_request"),
      v.literal("mutual_follow"),
      v.literal("direct_message")
    ),
    relatedRequestId: v.optional(v.id("trainRequests")),

    createdAt: v.number(),
  })
    .index("by_users", ["userIds"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_user_activity", ["userIds", "isActive"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),

    // Message Content
    content: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("video"), v.literal("audio"))
    ),

    // Message Status
    readBy: v.optional(v.array(v.id("users"))),
    isDeleted: v.boolean(),
    isEdited: v.boolean(),

    // Reply System (optional for later)
    replyToMessageId: v.optional(v.id("messages")),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_chat", ["chatId", "createdAt"])
    .index("by_sender", ["senderId"])
    .index("by_unread", ["chatId", "readBy"]),

  // ──────── SOCIAL SYSTEM ────────
  follows: defineTable({
    followerId: v.id("users"),
    followingId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_follower", ["followerId"])
    .index("by_following", ["followingId"])
    .index("by_mutual", ["followerId", "followingId"]),

  // ──────── BLOCKING & REPORTING ────────
  blockedUsers: defineTable({
    blockerId: v.id("users"),
    blockedId: v.id("users"),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_blocker", ["blockerId"])
    .index("by_blocked", ["blockedId"]),

  reports: defineTable({
    reporterId: v.id("users"),
    reportedUserId: v.optional(v.id("users")),
    reportedPostId: v.optional(v.id("posts")),
    reportedMessageId: v.optional(v.id("messages")),

    reason: v.union(
      v.literal("spam"),
      v.literal("harassment"),
      v.literal("inappropriate_content"),
      v.literal("fake_profile"),
      v.literal("other")
    ),
    description: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("resolved"),
      v.literal("dismissed")
    ),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_reporter", ["reporterId"])
    .index("by_status", ["status"])
    .index("by_reported_user", ["reportedUserId"]),

  // ──────── NOTIFICATIONS ────────
  notifications: defineTable({
    userId: v.id("users"),
    type: v.union(
      v.literal("train_request"),
      v.literal("train_accepted"),
      v.literal("message"),
      v.literal("event_reminder"),
      v.literal("follow"),
      v.literal("like"),
      v.literal("comment"),
      v.literal("leaderboard_reward"),
      v.literal("system")
    ),

    title: v.string(),
    body: v.string(),

    // Related entities
    relatedUserId: v.optional(v.id("users")),
    relatedPostId: v.optional(v.id("posts")),
    relatedEventId: v.optional(v.id("events")),
    relatedRequestId: v.optional(v.id("trainRequests")),

    // Notification Status
    isRead: v.boolean(),
    isPushed: v.boolean(), // sent via push notification

    // Optional action data
    actionUrl: v.optional(v.string()),

    createdAt: v.number(),
  })
    .index("by_user", ["userId", "createdAt"])
    .index("by_unread", ["userId", "isRead"])
    .index("by_type", ["type"]),

  // ──────── SYSTEM TABLES ────────
  appConfig: defineTable({
    key: v.string(),
    value: v.union(v.string(), v.number(), v.boolean(), v.object({})),
    description: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_key", ["key"]),

  // For analytics and debugging
  systemLogs: defineTable({
    type: v.union(
      v.literal("error"),
      v.literal("warning"),
      v.literal("info"),
      v.literal("debug")
    ),
    message: v.string(),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_type", ["type", "createdAt"])
    .index("by_user", ["userId"]),
});
