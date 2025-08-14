import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

// Create or get existing chat between two users
export const createOrGetChat = mutation({
  args: {
    otherUserId: v.id("users"),
    reason: v.union(
      v.literal("train_request"),
      v.literal("mutual_follow"),
      v.literal("direct_message")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const currentUserId = currentUser._id;
    const otherUserId = args.otherUserId;

    if (currentUserId === otherUserId) {
      throw new Error("Cannot create chat with yourself");
    }

    const userAChats = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", currentUserId))
      .collect();
    const chatIdsA = userAChats.map((cu) => cu.chatId);

    // Find chatIds for userB
    const userBChats = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", otherUserId))
      .collect();
    const chatIdsB = userBChats.map((cu) => cu.chatId);

    // Find intersection
    const commonChatId = chatIdsA.find((id) => chatIdsB.includes(id));

    if (commonChatId) {
      return commonChatId;
    }

    // Create new chat
    const chatId = await ctx.db.insert("chats", {
      lastMessageAt: Date.now(),
      isActive: true,
      creationReason: args.reason,
      createdAt: Date.now(),
    });

    await ctx.db.insert("chatUsers", {
      userId: currentUserId,
      chatId: chatId,
    });
    await ctx.db.insert("chatUsers", {
      userId: otherUserId,
      chatId: chatId,
    });

    console.log(
      `Created new chat ${chatId} between ${currentUserId} and ${otherUserId}`
    );
    return chatId;
  },
});

// Send a message
export const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Verify user is part of the chat
    const chat = await ctx.db.get(args.chatId);
    const room = await ctx.db
      .query("chatUsers")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", currentUser._id)
      )
      .unique();

    if (!chat || !room) {
      throw new Error("Chat not found or access denied");
    }

    // Create message
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      senderId: currentUser._id,
      content: args.content.trim(),
      readBy: [currentUser._id], // Sender has read their own message
      isDeleted: false,
      isEdited: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    console.log(`Created message ${messageId} in chat ${args.chatId}`);

    // Update chat metadata
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
      lastMessagePreview: args.content.trim().substring(0, 50),
    });

    return messageId;
  },
});

// Get chat messages
export const getChatMessages = query({
  args: {
    chatId: v.id("chats"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const chat = await ctx.db.get(args.chatId);
    const room = await ctx.db
      .query("chatUsers")
      .withIndex("by_chat_and_user", (q) =>
        q.eq("chatId", args.chatId).eq("userId", currentUser._id)
      )
      .unique();

    if (!chat || !room) {
      throw new Error("Chat not found or access denied");
    }

    // Get messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enhance messages with sender data
    const messagesWithSenders = await Promise.all(
      messages.page.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          sender: sender
            ? {
                _id: sender._id,
                username: sender.username,
                avatarUrl: sender.avatarUrl,
                isVerified: sender.isVerified,
              }
            : null,
        };
      })
    );

    return {
      ...messages,
      page: messagesWithSenders,
    };
  },
});

// Get user's chats (conversations list)

export const getUserChats = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, { paginationOpts }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Paginate chat user entries
    const chatUserEntriesResult = await ctx.db
      .query("chatUsers")
      .withIndex("by_user_id", (q) => q.eq("userId", currentUser._id))
      .paginate(paginationOpts);

    const chatIds = chatUserEntriesResult.page.map((entry) => entry.chatId);

    const chats = await Promise.all(
      chatIds.map((chatId) => ctx.db.get(chatId))
    );

    // Enhance chats with other user data
    const chatsWithUsers = await Promise.all(
      chats.map(async (chat) => {
        if (!chat) return null;

        // Get all chatUsers entries for this chat
        const chatUserEntries = await ctx.db
          .query("chatUsers")
          .withIndex("by_chat_id", (q) => q.eq("chatId", chat._id))
          .collect();

        // Exclude the current user
        const otherUserEntry = chatUserEntries.find(
          (entry) => entry.userId !== currentUser._id
        );

        let otherUser = null;
        if (otherUserEntry) {
          const user = await ctx.db.get(otherUserEntry.userId);
          if (user) {
            otherUser = {
              _id: user._id,
              username: user.username,
              avatarUrl: user.avatarUrl,
              isVerified: user.isVerified,
            };
          }
        }

        return {
          ...chat,
          otherUser,
        };
      })
    );

    // Return paginated result with cursor info
    return {
      ...chatUserEntriesResult,
      page: chatsWithUsers.filter(Boolean), // Remove nulls
    };
  },
});

// Mark messages as read
export const markMessagesAsRead = mutation({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    // Get unread messages in this chat
    const unreadMessages = await ctx.db
      .query("messages")
      .withIndex("by_chat", (q) => q.eq("chatId", args.chatId))
      .filter((q) =>
        q.or(
          q.eq(q.field("readBy"), undefined),
          q.neq(q.field("readBy"), undefined)
        )
      )
      .collect();

    // Filter messages that haven't been read by current user
    const messagesToMark = unreadMessages.filter((message) => {
      if (message.senderId === currentUser._id) return false; // Don't mark own messages
      const readBy = message.readBy || [];
      return !readBy.includes(currentUser._id);
    });

    // Mark each message as read
    for (const message of messagesToMark) {
      const readBy = message.readBy || [];
      await ctx.db.patch(message._id, {
        readBy: [...readBy, currentUser._id],
      });
    }

    return { success: true };
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!currentUser) {
      throw new Error("User not found");
    }

    const message = await ctx.db.get(args.messageId);
    if (!message || message.senderId !== currentUser._id) {
      throw new Error("Message not found or access denied");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
