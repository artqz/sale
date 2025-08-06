import type { Route } from "./+types/links";

export async function loader({ params }: Route.LoaderArgs) {
  console.log(params.documentId);

  return { documentId: params.documentId }
}

export function DocumentEditLinksRoute({ loaderData }: Route.ComponentProps) {
  return <div>test {loaderData.documentId}</div>
}