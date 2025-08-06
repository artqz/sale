import { data } from 'react-router';
import { DealList } from '~/components/deals/DealList';
import { db } from '~/db/db.server';
import { useAuthUser } from '~/hooks/useAuthUser';
import type { Route } from './+types/index';

export function meta(_: Route.MetaArgs) {
  return [
    { title: 'Скидки - Sale App' },
    { name: 'description', content: 'Лучшие скидки и предложения' },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  const deals = await db.query.deal.findMany({
    orderBy: (deal, { desc }) => [desc(deal.createdAt)],
    columns: {
      id: true,
      title: true,
      body: true,
      image: true,
      slug: true,
      createdAt: true,
      userId: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          image: true,
        }
      },
      ratings: {
        columns: {
          rating: true,
        }
      }
    }
  });
  
  // Загружаем пользователей для каждой скидки
  const userIds = [...new Set(deals.map(deal => deal.userId))];
  const users = await db.query.user.findMany({
    where: (user, { inArray }) => inArray(user.id, userIds),
    columns: {
      id: true,
      name: true,
      image: true,
    }
  });
  
  // Создаем map для быстрого поиска пользователей
  const userMap = new Map(users.map(user => [user.id, user]));
  
  // Добавляем данные пользователей и вычисляем рейтинги
  const dealsWithUsers = deals.map(deal => {
    const user = userMap.get(deal.userId);
    
    return {
      ...deal,
      body: deal.body ? JSON.stringify(deal.body) : null,
      user,
    };
  });
  
  return data({ deals: dealsWithUsers });
}

export default function DealsRoute({
  loaderData: { deals },
  actionData,
}: Route.ComponentProps) {
  const { user } = useAuthUser();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Скидки и предложения
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Найди лучшие цены на товары в популярных маркетплейсах
        </p>
      </div>

      <DealList deals={deals} />
    </div>
  );
}
