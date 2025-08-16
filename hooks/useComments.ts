import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface Comment {
  id: string;
  user: {
    username: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  text: string;
  createdAt: number;
  likeCount?: number;
}

export function useComments(postId: Id<"posts">) {
  const comments = useQuery(api.comments.getPostComments, { postId });
  const createComment = useMutation(api.comments.createComment);
  const deleteComment = useMutation(api.comments.deleteComment);

  const submitComment = async (content: string) => {
    try {
      await createComment({ postId, content });
    } catch (error) {
      console.error("Failed to create comment:", error);
      throw error;
    }
  };

  const removeComment = async (commentId: Id<"comments">) => {
    try {
      await deleteComment({ commentId });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      throw error;
    }
  };

  return {
    comments: comments || [],
    submitComment,
    removeComment,
    isLoading: comments === undefined,
  };
}