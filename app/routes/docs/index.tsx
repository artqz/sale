import { db } from "~/db/db.server";
import type { Route } from "./+types/index";
import { useAuthUser } from "~/hooks/useAuthUser";
import { authSessionContext } from "~/utils/contexts";
import { data } from "react-router";
import { DocumentList } from "~/components/documents/DocumentList";
import { DocsTable } from "~/components/documents/DocsTable";

export async function loader({ context }: Route.LoaderArgs) {
  const documents = await db.query.document.findMany({
    orderBy: (todo, { desc }) => [desc(todo.createdAt)],
  });
  return data({ documents });
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function DocumentsRoute({
  loaderData: { documents },
}: Route.ComponentProps) {
  // const { user } = useAuthUser();

  return (
    <>
      <DocsTable data={documents} />
    </>
  );
}
