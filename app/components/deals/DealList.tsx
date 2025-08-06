import { calculateDealRating } from "~/utils/common";
import { DealCard } from "./DealCard";

export interface Deal {
  id: number;
  title: string;
  body: string | null;
  image: string | null;
  slug: string;
  createdAt: Date | null;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
  ratings?: Array<{ rating: number }>;
  rating?: number;
  likes?: number;
  dislikes?: number;
  totalVotes?: number;
}

interface DealListProps {
  deals: Deal[];
  currentUserId?: string;
  onAddComment?: (dealId: number, text: string) => void;
}

export function DealList({ deals }: DealListProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
          Пока нет скидок
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Будь первым, кто добавит интересную скидку!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deals.map((deal) => {
        // Вычисляем рейтинг если не передан
        const ratingData = deal.rating !== undefined 
          ? { rating: deal.rating, totalVotes: deal.totalVotes || 0 }
          : calculateDealRating(deal.ratings || []);

        return (
          <DealCard
            key={deal.id}
            id={deal.id}
            url={"123"}
            title={deal.title}
            body={deal.body ?? null}
            slug={deal.slug}
            image={deal.image}
            createdAt={deal.createdAt || undefined}
            author={deal.user ? {
              name: deal.user.name,
              image: deal.user.image,
            } : undefined}
            rating={ratingData.rating}
            ratingCount={ratingData.totalVotes}
            prices={[
              { marketplace: "ozon", price: 1000, url: "https://ozon.ru/" },
              { marketplace: "wildberries", price: 1100, url: "https://wb.ru/" },
              { marketplace: "dns", price: 1200, url: "https://dns.ru/" },
            ]}
          />
        );
      })}
    </div>
  );
} 