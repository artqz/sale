import type { Route } from "./+types/huy";

export async function loader({ params }: Route.LoaderArgs) {
  console.log(params.documentId);

  return { documentId: params.documentId }
}

export function DocumentEditHuyRoute({ loaderData }: Route.ComponentProps) {
  return <div>test {loaderData.documentId}</div>
}