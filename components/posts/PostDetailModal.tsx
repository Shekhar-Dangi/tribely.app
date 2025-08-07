import { Id } from "@/convex/_generated/dataModel";
import PostModal from "./PostModal";

interface PostDetailModalProps {
  visible: boolean;
  onClose: () => void;
  postId: Id<"posts"> | null;
}

/**
 * Standalone modal for showing post details by ID
 * Useful for navigating to specific posts from notifications, links, etc.
 */
export default function PostDetailModal({
  visible,
  onClose,
  postId,
}: PostDetailModalProps) {
  // This will need a getPost query to be implemented later
  // For now, we'll return null

  return (
    <PostModal
      visible={visible}
      onClose={onClose}
      post={null} // Will be populated when getPost query is implemented
    />
  );
}
