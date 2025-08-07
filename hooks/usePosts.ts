import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Hook to fetch user's posts
 */
export function useUserPosts(
  userId?: Id<"users">,
  privacy?: "public" | "friends" | "private"
) {
  return useQuery(
    api.posts.getUserPosts,
    userId ? { userId, privacy } : "skip"
  );
}

/**
 * Hook to fetch feed posts (public posts)
 */
export function useFeedPosts(limit?: number) {
  return useQuery(api.posts.getFeedPosts, { limit });
}

/**
 * Hook to get a specific post by ID (when we add this query later)
 */
export function usePost(postId?: Id<"posts">) {
  // This will be implemented when we add getPost query
  return null;
}
