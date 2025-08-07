import { data } from "react-router";
import { db } from "~/db/db.server";
import { user as schemaUser, document as schemaDocument } from "~/db/schema";
import { ilike, or } from "drizzle-orm";

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "users"; // "users" или "documents"
  const limit = parseInt(url.searchParams.get("limit") || "10");

  if (!query.trim()) {
    return data({ results: [] });
  }

  try {
    if (type === "users") {
      const users = await db
        .select({
          value: schemaUser.id,
          label: schemaUser.name,
        })
        .from(schemaUser)
        .where(
          or(
            ilike(schemaUser.name, `%${query}%`),
            ilike(schemaUser.email, `%${query}%`)
          )
        )
        .limit(limit);

      return data({ results: users });
    } else if (type === "documents") {
      const documents = await db
        .select({
          value: schemaDocument.id,
          label: schemaDocument.title,
        })
        .from(schemaDocument)
        .where(
          or(
            ilike(schemaDocument.title, `%${query}%`),
            ilike(schemaDocument.registrationNumber, `%${query}%`)
          )
        )
        .limit(limit);

      return data({ results: documents });
    }

    return data({ results: [] });
  } catch (error) {
    console.error("Search error:", error);
    return data({ error: "Ошибка поиска" }, { status: 500 });
  }
}