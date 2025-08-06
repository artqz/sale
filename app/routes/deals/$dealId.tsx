import { data, redirect } from "react-router";
import { DealCard } from "~/components/deals/DealCard";
import { DealComments } from "~/components/deals/DealComments";
import { db } from "~/db/db.server";
import { deal } from "~/db/schema";
import { getComments } from "~/utils/comments";
import { calculateDealRating } from "~/utils/common";
import { getAuthSession } from "~/utils/middlewares/authGuard.server";

export function meta({ params }: { params: { dealId: string } }) {
  return [
    { title: `Скидка - Sale App` },
    { name: "description", content: "Детальная информация о скидке" },
  ];
}

export async function loader({ params, request }: { params: { dealId: string }; request: Request }) {
  const dealId = parseInt(params.dealId);
  
  if (isNaN(dealId)) {
    throw redirect("/deals");
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

  const deal = await db.query.deal.findFirst({
    where: (deal, { eq }) => eq(deal.id, dealId),
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
      },
    }
  });

  if (!deal) {
    throw redirect("/deals");
  }

  // Получаем комментарии используя новую универсальную систему
  const comments = await getComments(dealId, "deal");

  // Вычисляем рейтинг
  const ratingData = calculateDealRating(deal.ratings || []);

  return data({ 
    deal: {
      ...deal,
      rating: ratingData.rating,
      likes: ratingData.likes,
      dislikes: ratingData.dislikes,
      totalVotes: ratingData.totalVotes,
    },
    comments,
    currentUser
  });
}

// Роут только для отображения данных, логика комментариев перенесена в API

export default function DealDetailRoute({
  loaderData,
}: {
  loaderData: { deal: any; comments: any[]; currentUser: any };
}) {
  const { deal, comments, currentUser } = loaderData;

  return (
    <div className="space-y-6">
      <DealCard 
        id={deal.id}
        title={deal.title}
        body={deal.body || ""}
        url="#"
        prices={[
          { marketplace: "ozon", price: 1000, url: "https://ozon.ru/" },
          { marketplace: "wildberries", price: 1100, url: "https://wb.ru/" },
          { marketplace: "dns", price: 1200, url: "https://dns.ru/" },
        ]}
        image={deal.image}
        createdAt={deal.createdAt}
        author={deal.user ? {
          name: deal.user.name,
          image: deal.user.image,
        } : undefined}
        rating={deal.rating}
        ratingCount={deal.totalVotes}
        showComments={false}
      />
      <DealComments 
        dealId={deal.id} 
        comments={comments} 
        currentUserId={currentUser?.id} 
      />
    </div>
  );
} 