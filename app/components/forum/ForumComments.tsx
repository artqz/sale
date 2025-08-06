import { type Comment, Comments } from "../Comments";

interface ForumCommentsProps {
  topicId: number;
  comments: Comment[];
  currentUserId?: string;
}

export function ForumComments({ topicId, comments, currentUserId }: ForumCommentsProps) {
  return (
    <Comments
      entityId={topicId}
      entityType="forum_topic"
      comments={comments}
      currentUserId={currentUserId}
      actionUrl="/api/comments"
    />
  );
} 