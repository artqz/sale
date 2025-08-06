import { data, redirect } from "react-router";
import { ForumComments } from "~/components/forum/ForumComments";
import { getComments } from "~/utils/comments";
import { getAuthSession } from "~/utils/middlewares/authGuard.server";

export function meta({ params }: { params: { topicId: string } }) {
  return [
    { title: `Тема форума - Sale App` },
    { name: "description", content: "Обсуждение темы на форуме" },
  ];
}

export async function loader({ params, request }: { params: { topicId: string }; request: Request }) {
  const topicId = parseInt(params.topicId);
  
  if (isNaN(topicId)) {
    throw redirect("/forum");
  }

  // Получаем текущего пользователя (если авторизован)
  let currentUser = null;
  try {
    const session = await getAuthSession(request);
    if (session) {
      currentUser = {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      };
    }
  } catch (error) {
    // Пользователь не авторизован - это нормально
    console.log("User not authenticated");
  }

  // Здесь должна быть логика получения темы форума
  // Пока используем заглушку
  const topic = {
    id: topicId,
    title: `Тема форума #${topicId}`,
    content: "Содержание темы форума...",
    author: {
      name: "Автор темы",
      image: null,
    },
    createdAt: new Date(),
  };

  // Получаем комментарии используя универсальную систему
  const comments = await getComments(topicId, "forum_topic");

  return data({ 
    topic,
    comments,
    currentUser
  });
}

// Роут только для отображения данных, логика комментариев перенесена в API

export default function ForumTopicRoute({
  loaderData,
}: {
  loaderData: { topic: any; comments: any[]; currentUser: any };
}) {
  const { topic, comments, currentUser } = loaderData;

  return (
    <div className="space-y-6">
      {/* Заголовок темы */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {topic.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <span>Автор: {topic.author.name}</span>
          <span>•</span>
          <span>{topic.createdAt.toLocaleDateString()}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {topic.content}
        </p>
      </div>

      {/* Комментарии */}
      <ForumComments 
        topicId={topic.id} 
        comments={comments} 
        currentUserId={currentUser?.id} 
      />
    </div>
  );
} 