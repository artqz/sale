import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "~/db/db.server";
import { comment, commentRating, user } from "~/db/schema";

export interface CommentWithUser {
  id: number;
  text: string;
  createdAt: Date;
  parentId?: number | null;
  isDeleted: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  ratings?: Array<{ rating: number }>;
  replies?: CommentWithUser[];
}

/**
 * Получить комментарии для сущности
 */
export async function getComments(
  entityId: string | number,
  entityType: string
): Promise<CommentWithUser[]> {
  const comments = await db
    .select({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      parentId: comment.parentId,
      isDeleted: comment.isDeleted,
      user: {
        id: user.id,
        name: user.name,
        image: user.image,
      },
    })
    .from(comment)
    .innerJoin(user, eq(comment.userId, user.id))
    .where(
      and(
        eq(comment.entityId, entityId.toString()),
        eq(comment.entityType, entityType),
        eq(comment.isDeleted, false)
      )
    )
    .orderBy(desc(comment.createdAt));

  // Получаем рейтинги для всех комментариев
  const commentIds = comments.map(c => c.id);
  const ratings = await db
    .select({
      commentId: commentRating.commentId,
      rating: commentRating.rating,
    })
    .from(commentRating)
    .where(inArray(commentRating.commentId, commentIds));

  // Группируем рейтинги по комментариям
  const ratingsByComment = ratings.reduce((acc, rating) => {
    if (!acc[rating.commentId]) {
      acc[rating.commentId] = [];
    }
    acc[rating.commentId].push({ rating: rating.rating });
    return acc;
  }, {} as Record<number, Array<{ rating: number }>>);

  // Добавляем рейтинги к комментариям
  const commentsWithRatings = comments.map(comment => ({
    ...comment,
    ratings: ratingsByComment[comment.id] || [],
  }));

  return commentsWithRatings;
}

/**
 * Добавить комментарий
 */
export async function addComment(
  entityId: string | number,
  entityType: string,
  userId: string,
  text: string,
  parentId?: number
): Promise<{ success: boolean; commentId?: number; error?: string }> {
  try {
    const [newComment] = await db
      .insert(comment)
      .values({
        entityId: entityId.toString(),
        entityType,
        userId,
        text,
        parentId,
      })
      .returning({ id: comment.id });

    return { success: true, commentId: newComment.id };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: "Ошибка при добавлении комментария" };
  }
}

/**
 * Удалить комментарий
 */
export async function deleteComment(
  commentId: number,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Проверяем, что пользователь является автором комментария
    const existingComment = await db
      .select()
      .from(comment)
      .where(and(eq(comment.id, commentId), eq(comment.userId, userId)))
      .limit(1);

    if (existingComment.length === 0) {
      return { success: false, error: "Комментарий не найден или у вас нет прав на его удаление" };
    }

    await db
      .update(comment)
      .set({ isDeleted: true })
      .where(eq(comment.id, commentId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: "Ошибка при удалении комментария" };
  }
}

/**
 * Добавить рейтинг к комментарию
 */
export async function rateComment(
  commentId: number,
  userId: string,
  rating: number
): Promise<{ success: boolean; error?: string }> {
  try {
    // Проверяем, что комментарий существует
    const existingComment = await db
      .select()
      .from(comment)
      .where(eq(comment.id, commentId))
      .limit(1);

    if (existingComment.length === 0) {
      return { success: false, error: "Комментарий не найден" };
    }

    // Проверяем, не голосовал ли уже пользователь
    const existingRating = await db
      .select()
      .from(commentRating)
      .where(and(eq(commentRating.commentId, commentId), eq(commentRating.userId, userId)))
      .limit(1);

    if (existingRating.length > 0) {
      // Обновляем существующий рейтинг
      await db
        .update(commentRating)
        .set({ rating })
        .where(and(eq(commentRating.commentId, commentId), eq(commentRating.userId, userId)));
    } else {
      // Добавляем новый рейтинг
      await db
        .insert(commentRating)
        .values({
          commentId,
          userId,
          rating,
          createdAt: new Date(),
        });
    }

    return { success: true };
  } catch (error) {
    console.error("Error rating comment:", error);
    return { success: false, error: "Ошибка при голосовании" };
  }
}

/**
 * Получить количество комментариев для сущности
 */
export async function getCommentCount(
  entityId: string | number,
  entityType: string
): Promise<number> {
  const result = await db
    .select({ count: comment.id })
    .from(comment)
    .where(
      and(
        eq(comment.entityId, entityId.toString()),
        eq(comment.entityType, entityType),
        eq(comment.isDeleted, false)
      )
    );

  return result.length;
} 