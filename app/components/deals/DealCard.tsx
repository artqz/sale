import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";
import { HeartIcon, MessageCircleIcon, ShareIcon } from "lucide-react";
import { Link } from "react-router";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import { Button } from "~/components/ui/Button";

interface DealCardProps {
  id: string;
  title: string;
  price: number;
  body: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  likes: number;
  comments: number;
}

export function DealCard({ id, title, price, body, createdAt, user, likes, comments }: DealCardProps) {
  // Извлекаем текст из JSON структуры EditorJS
  const extractTextFromEditorJS = (jsonString: string | null): string => {
    if (!jsonString) return "";
    
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks
          .map((block: any) => {
            if (block.type === "paragraph" || block.type === "header") {
              return block.data.text || "";
            } else if (block.type === "list" && block.data.items) {
              return block.data.items.join(" ");
            } else if (block.type === "quote") {
              return block.data.text || "";
            } else if (block.type === "code") {
              return block.data.text || "";
            }
            return "";
          })
          .join(" ")
          .trim();
      }
    } catch {
      // Если не удалось распарсить JSON, возвращаем как есть
      return jsonString;
    }
    
    return "";
  };

  const plainText = extractTextFromEditorJS(body);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(createdAt, { addSuffix: true, locale: ru })}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {price.toLocaleString("ru-RU")} ₽
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            <Link to={`/deals/${id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
              {title}
            </Link>
          </h3>
          {plainText && (
            <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
              {plainText}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-6">
            <button 
              type="button"
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            >
              <HeartIcon className="w-5 h-5" />
              <span className="text-sm">{likes}</span>
            </button>
            <Link 
              to={`/deals/${id}`}
              className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              <MessageCircleIcon className="w-5 h-5" />
              <span className="text-sm">{comments}</span>
            </Link>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
            <ShareIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 