import { redirect } from "react-router";
import type { Route } from "./+types/addDocument";
import { db } from "~/db/db.server";
import { document } from "~/db/schema";
import { authSessionContext } from "~/utils/contexts";

export async function action({ context }: Route.ActionArgs) {
  const { user } = context.get(authSessionContext);

  try {
    const tx = await db.transaction(async (tx) => {
      // Добавление документа
      try {
        const [newDocument] = await tx
          .insert(document)
          .values({
            title: "Без названия",
            userId: user.id,
            type: "INCOMING",
          })
          .returning({
            id: document.id,
          });
        return { document: newDocument }
      } catch (error) {
        console.log(error);
        throw new Response("Ошибка создания черновика", {
          status: 400,
          headers: {
            "Content-Type": "text/plain; charset=utf-8"
          }
        });
      }
    });
    return redirect(`/docs/${tx.document.id}/edit`, {
    })
  } catch (error) {
    throw new Response("Ошибка создания черновика", {
      status: 400,
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

}