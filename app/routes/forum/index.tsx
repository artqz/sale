import { Link } from "react-router";

export function meta() {
  return [
    { title: `Форум - Sale App` },
    { name: "description", content: "Форум для обсуждения скидок и покупок" },
  ];
}

export default function ForumIndexRoute() {
  // Заглушка для тем форума
  const topics = [
    { id: 1, title: "Лучшие скидки на электронику", author: "Пользователь1", replies: 5, views: 120 },
    { id: 2, title: "Как найти хорошие скидки?", author: "Пользователь2", replies: 3, views: 89 },
    { id: 3, title: "Отзывы о магазинах", author: "Пользователь3", replies: 12, views: 234 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Форум
        </h1>
        <Link 
          to="/forum/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Создать тему
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Темы форума
          </h2>
          
          <div className="space-y-4">
            {topics.map((topic) => (
              <div key={topic.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <Link 
                  to={`/forum/topics/${topic.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 p-3 rounded-lg transition-colors"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                    {topic.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Автор: {topic.author}</span>
                    <span>•</span>
                    <span>{topic.replies} ответов</span>
                    <span>•</span>
                    <span>{topic.views} просмотров</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 