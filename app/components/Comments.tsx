import { Clock, MessageCircle, MoreHorizontal, Reply, Send, ThumbsDown, ThumbsUp, TrendingUp } from "lucide-react";
import React, { useState } from "react";
import { Form, useFetcher, useNavigation } from "react-router";
import { toast } from "sonner";
import { useAuthUser } from "~/hooks/useAuthUser";
import { calculateCommentRating, formatTimeAgo, getAvatarUrl } from "~/utils/common";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/Avatar";
import { Button } from "./ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/DropdownMenu";

export interface Comment {
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
  replies?: Comment[];
}

interface CommentsProps {
  entityId: number | string; // ID сущности (скидка, тема форума и т.д.)
  entityType: string; // Тип сущности ('deal', 'forum_topic', etc.)
  comments: Comment[];
  currentUserId?: string;
  actionUrl: string; // URL для отправки действий с комментариями
  ratingActionUrl?: string; // URL для рейтинга (если отличается от основного)
}

export function Comments({ 
  entityId, 
  entityType, 
  comments, 
  currentUserId, 
  actionUrl,
  ratingActionUrl 
}: CommentsProps) {
  const { user } = useAuthUser();
  const [expandedComments, setExpandedComments] = React.useState<Set<number>>(new Set());
  const [replyingTo, setReplyingTo] = React.useState<number | null>(null);
  const [sortBy, setSortBy] = React.useState<"newest" | "rating">("newest");
  const [ratingLoading, setRatingLoading] = React.useState<number | null>(null);
  const [lastReplyParentId, setLastReplyParentId] = React.useState<number | null>(null);
  const [processedCommentIds, setProcessedCommentIds] = React.useState<Set<number>>(new Set());
  const [newComments, setNewComments] = React.useState<Set<number>>(new Set());
  const [isCommentFormExpanded, setIsCommentFormExpanded] = React.useState(false);
  
  // Функция для прокрутки к комментарию
  const scrollToComment = React.useCallback((commentId: number) => {
    setTimeout(() => {
      const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`) as HTMLElement;
      if (commentElement) {
        commentElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  }, []);
  
  // Сбрасываем состояние при изменении replyingTo
  React.useEffect(() => {
    if (replyingTo !== null) {
      // Можно добавить дополнительную логику при необходимости
    }
  }, [replyingTo]);
  
  const ratingFetcher = useFetcher();
  const commentFetcher = useFetcher();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting" || commentFetcher.state === "submitting";

  // Обработка всех комментариев через commentFetcher (заменяет actionData)

  // Обработка рейтинга
  React.useEffect(() => {
    if (ratingFetcher.data?.success && ratingLoading !== null) {
      toast.success(ratingFetcher.data.message || "Голос учтен!");
      setRatingLoading(null);
    } else if (ratingFetcher.data?.error && ratingLoading !== null) {
      toast.error(ratingFetcher.data.error);
      setRatingLoading(null);
    }
  }, [ratingFetcher.data?.success, ratingFetcher.data?.error, ratingFetcher.data?.message, ratingLoading]);

  // Обработка добавления/удаления комментариев
  React.useEffect(() => {
    if (commentFetcher.data?.success && commentFetcher.data.commentId && !processedCommentIds.has(commentFetcher.data.commentId)) {
      setProcessedCommentIds(prev => new Set([...prev, commentFetcher.data.commentId!]));
      
      toast.success(commentFetcher.data.message || "Комментарий добавлен!");
      
      // Добавляем новый комментарий в список для подсветки
      setNewComments(prev => new Set([...prev, commentFetcher.data.commentId!]));
      
      // Прокручиваем к новому комментарию
      scrollToComment(commentFetcher.data.commentId);
      
      // Убираем подсветку через 3 секунды
      setTimeout(() => {
        setNewComments(prev => {
          const newSet = new Set(prev);
          newSet.delete(commentFetcher.data.commentId!);
          return newSet;
        });
      }, 3000);
      
      // Автоматически показываем ответы для родительского комментария
      if (lastReplyParentId) {
        setExpandedComments(prev => new Set([...prev, lastReplyParentId]));
        setLastReplyParentId(null);
      }
      
      // Очищаем состояние ответа только если это добавление комментария
      if (commentFetcher.data.message === "Комментарий добавлен") {
        setReplyingTo(null);
        setIsCommentFormExpanded(false);
        
        // Очищаем основную форму добавления комментария
        const mainForm = document.querySelector('form[data-comment-form]') as HTMLFormElement;
        const mainTextarea = mainForm?.querySelector('textarea[name="text"]') as HTMLTextAreaElement;
        if (mainTextarea) {
          mainTextarea.value = "";
        }
      }
    } else if (commentFetcher.data?.error) {
      toast.error(commentFetcher.data.error);
    }
  }, [commentFetcher.data, lastReplyParentId, processedCommentIds, scrollToComment]);

  // Функция для переключения видимости ответов
  const toggleReplies = (commentId: number) => {
    setExpandedComments(prev => 
      prev.has(commentId) 
        ? new Set([...prev].filter(id => id !== commentId))
        : new Set([...prev, commentId])
    );
  };

  // Функция для начала ответа
  const startReply = (commentId: number) => {
    // Если уже отвечаем на этот комментарий, закрываем форму
    if (replyingTo === commentId) {
      setReplyingTo(null);
      setLastReplyParentId(null);
      return;
    }
    
    setReplyingTo(commentId);
    setLastReplyParentId(commentId); // Сохраняем для автоматического раскрытия
  };

  // useEffect для вставки текста в textarea при изменении replyingTo
  React.useEffect(() => {
    if (replyingTo !== null) {
      const replyForm = document.querySelector(`[data-reply-form="${replyingTo}"]`) as HTMLFormElement;
      const textarea = replyForm?.querySelector('textarea[name="text"]') as HTMLTextAreaElement;
      if (textarea) {
        const comment = comments.find(c => c.id === replyingTo);
        if (comment) {
          textarea.value = `@${comment.user.name}, `;
          textarea.focus();
          // Устанавливаем курсор в конец текста
          textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
      }
    }
  }, [replyingTo, comments]);

  // useEffect для фокуса на основной форме при разворачивании
  React.useEffect(() => {
    if (isCommentFormExpanded) {
      const mainForm = document.querySelector('form[method="post"]:not([data-reply-form])') as HTMLFormElement;
      const mainTextarea = mainForm?.querySelector('textarea[name="text"]') as HTMLTextAreaElement;
      if (mainTextarea) {
        // Небольшая задержка для перерендеринга
        setTimeout(() => {
          mainTextarea.focus();
        }, 100);
      }
    }
  }, [isCommentFormExpanded]);

  // Функция для отмены ответа
  const cancelReply = () => {
    setReplyingTo(null);
    setLastReplyParentId(null);
  };

  // Правильная сортировка комментариев: только корневые комментарии
  const getSortedComments = (comments: Comment[]): Comment[] => {
    // Только корневые комментарии (без parentId)
    const rootComments = comments.filter(comment => !comment.parentId);
    
    // Сортируем в зависимости от выбранного типа
    return rootComments.sort((a, b) => {
      if (sortBy === "rating") {
        // Сначала по рейтингу (популярные сначала), затем по дате
        const ratingA = calculateCommentRating(a.ratings || []).rating;
        const ratingB = calculateCommentRating(b.ratings || []).rating;
        
        // Сначала по рейтингу (убывание)
        if (ratingA !== ratingB) {
          return ratingB - ratingA;
        }
        
        // При одинаковом рейтинге по дате (новые сначала)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        // Сортировка по новизне (новые сначала)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const sortedComments = getSortedComments(comments);

  const CommentItem = ({ comment }: { comment: Comment }) => {
    const { avatarUrl, placeholderUrl } = getAvatarUrl(comment.user.image, comment.user.name);
    // Отступ только если это ответ (есть parentId)
    const marginLeft = comment.parentId ? 44 : 0;
    const isNewComment = newComments.has(comment.id);

    // Получаем ответы на этот комментарий (только для корневых комментариев)
    const replies = comment.parentId ? [] : comments
      .filter(c => c.parentId === comment.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const hasReplies = replies.length > 0;
    const isExpanded = expandedComments.has(comment.id);

    // Вычисляем рейтинг комментария
    const ratingData = calculateCommentRating(comment.ratings || []);
    
    return (
      <div className={`space-y-2 p-2 transition-all duration-1000 ${isNewComment ? 'bg-yellow-50 dark:bg-yellow-900/20 rounded-lg' : ''}`} data-comment-id={comment.id}>
        <div className="flex gap-3" style={{ marginLeft: `${marginLeft}px` }}>
          {/* Аватар */}
          <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
            <AvatarImage src={avatarUrl || placeholderUrl} />
            <AvatarFallback className="text-xs">
              {comment.user.name?.charAt(0) || "?"}
            </AvatarFallback>
          </Avatar>
          
          {/* Контент комментария */}
          <div className="flex-1 min-w-0">
            {/* Имя и время в одной строке */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {comment.user.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            
            {/* Текст комментария */}
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-2">
              {comment.text}
            </p>
            
            {/* Действия */}
            <div className="flex items-center gap-4">
              {/* Рейтинг комментария */}
              {currentUserId && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRatingLoading(comment.id);
                      ratingFetcher.submit(
                        {
                          action: "rate",
                          commentId: comment.id.toString(),
                          rating: "1"
                        },
                        { method: "post", action: ratingActionUrl || actionUrl }
                      );
                    }}
                    disabled={ratingLoading === comment.id}
                    className="flex items-center gap-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors disabled:opacity-50"
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span className="text-xs">{ratingData.likes}</span>
                  </button>
                  
                  <span className="text-xs text-gray-400">
                    {ratingData.rating}
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setRatingLoading(comment.id);
                      ratingFetcher.submit(
                        {
                          action: "rate",
                          commentId: comment.id.toString(),
                          rating: "-1"
                        },
                        { method: "post", action: ratingActionUrl || actionUrl }
                      );
                    }}
                    disabled={ratingLoading === comment.id}
                    className="flex items-center gap-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="h-3 w-3" />
                    <span className="text-xs">{ratingData.dislikes}</span>
                  </button>
                </div>
              )}

              {/* Показываем только счетчики для неавторизованных пользователей */}
              {!currentUserId && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <ThumbsUp className="h-3 w-3" />
                    <span className="text-xs">{ratingData.likes}</span>
                  </span>
                  
                  <span className="text-xs text-gray-400">
                    {ratingData.rating}
                  </span>
                  
                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                    <ThumbsDown className="h-3 w-3" />
                    <span className="text-xs">{ratingData.dislikes}</span>
                  </span>
                </div>
              )}

              {currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => startReply(comment.id)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-6 px-2 text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Ответить
                </Button>
              )}
              
              {/* Меню действий */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-6 px-2 text-xs"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {currentUserId === comment.user.id && (
                    <DropdownMenuItem asChild>
                      <commentFetcher.Form method="post" action={actionUrl}>
                        <input type="hidden" name="action" value="delete" />
                        <input type="hidden" name="commentId" value={comment.id} />
                        <input type="hidden" name="entityId" value={entityId} />
                        <input type="hidden" name="entityType" value={entityType} />
                        <button
                          type="submit"
                          className="w-full text-left px-2 py-1.5 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={(e) => {
                            if (!confirm("Удалить комментарий?")) {
                              e.preventDefault();
                            }
                          }}
                        >
                          Удалить
                        </button>
                      </commentFetcher.Form>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-gray-600 dark:text-gray-400">
                    Пожаловаться
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Кнопка показать/скрыть ответы (только для корневых комментариев) */}
            {!comment.parentId && hasReplies && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleReplies(comment.id)}
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 h-6 px-2 text-xs"
                >
                  {isExpanded ? `Скрыть ${replies.length} ${getPluralForm(replies.length, "ответ", "ответа", "ответов")}` : `Показать ${replies.length} ${getPluralForm(replies.length, "ответ", "ответа", "ответов")}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Форма ответа */}
        {replyingTo === comment.id && currentUserId && (
          <div className="ml-11" style={{ marginLeft: `${marginLeft + 44}px` }}>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <commentFetcher.Form method="post" action={actionUrl} className="space-y-3" data-reply-form={comment.id}>
                <input type="hidden" name="action" value="add" />
                <input type="hidden" name="parentId" value={comment.parentId || comment.id} />
                <input type="hidden" name="entityId" value={entityId} />
                <input type="hidden" name="entityType" value={entityType} />
                <div>
                  <textarea
                    name="text"
                    placeholder="Написать ответ..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                    required
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={cancelReply}
                    disabled={isSubmitting}
                    className="h-8 px-3 text-xs"
                  >
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 h-8 px-3 text-xs"
                  >
                    <Send className="h-3 w-3" />
                    {isSubmitting ? "Отправка..." : "Ответить"}
                  </Button>
                </div>
              </commentFetcher.Form>
            </div>
          </div>
        )}

        {/* Ответы (показываются только если развернуты и только для корневых комментариев) */}
        {!comment.parentId && hasReplies && isExpanded && (
          <div className="space-y-2">
            {replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Функция для правильных окончаний
  const getPluralForm = (count: number, one: string, few: string, many: string): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return many;
    }

    if (lastDigit === 1) {
      return one;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return few;
    }

    return many;
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Комментарии ({comments.length})
          </h3>
        </div>
        
        {/* Сортировка как на RUTUBE */}
        <div className="flex items-center gap-2 text-sm">
          <Button 
            variant={sortBy === "rating" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setSortBy("rating")}
            className={`transition-all duration-200 ${
              sortBy === "rating" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Сначала популярные
          </Button>
          <span className="text-gray-300">|</span>
          <Button 
            variant={sortBy === "newest" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setSortBy("newest")}
            className={`transition-all duration-200 ${
              sortBy === "newest" 
                ? "bg-blue-600 text-white shadow-md" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            Сначала новые
          </Button>
        </div>
      </div>

      {/* Форма добавления комментария в стиле RUTUBE */}
      {currentUserId && (
        <div className="space-y-2 p-2">
          <div className="flex gap-3">
            {/* Аватар пользователя */}
            <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
              <AvatarImage src={getAvatarUrl(user.image, user.name).avatarUrl || undefined} />
              <AvatarFallback className="text-xs">
                {user.name?.charAt(0) || "П"}
              </AvatarFallback>
            </Avatar>
            
            {/* Форма */}
            <div className="flex-1 min-w-0">
            {isCommentFormExpanded ? (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <commentFetcher.Form method="post" action={actionUrl} className="space-y-3" data-comment-form>
                  <input type="hidden" name="action" value="add" />
                  <input type="hidden" name="entityId" value={entityId} />
                  <input type="hidden" name="entityType" value={entityType} />
                  <div>
                    <textarea
                      name="text"
                      placeholder="Написать комментарий..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      rows={3}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  {/* Отображение ошибок */}
                  {commentFetcher.data?.error && (
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      {commentFetcher.data.error}
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsCommentFormExpanded(false)}
                      disabled={isSubmitting}
                      className="h-8 px-3 text-xs"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 h-8 px-3 text-xs"
                    >
                      <Send className="h-3 w-3" />
                      {isSubmitting ? "Отправка..." : "Отправить"}
                    </Button>
                  </div>
                </commentFetcher.Form>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsCommentFormExpanded(true)}
                  className="w-full text-left text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm py-2 px-3 h-8 flex items-center"
                >
                  Написать комментарий...
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Список комментариев */}
      <div className="space-y-4 transition-all duration-300">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Пока нет комментариев. Будь первым!
          </div>
        ) : (
          sortedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
} 