import { type Comment, Comments } from "../Comments";

interface DealCommentsProps {
  dealId: number;
  comments: Comment[];
  currentUserId?: string;
}

export function DealComments({ dealId, comments, currentUserId }: DealCommentsProps) {
  return (
    <Comments
      entityId={dealId}
      entityType="deal"
      comments={comments}
      currentUserId={currentUserId}
      actionUrl="/api/comments"
    />
  );
} 