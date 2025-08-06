import { Outlet } from "react-router";

import { Menu } from "~/components/documents/DocMenu";
import type { Route } from "./+types/layout";

export default function Layout({ params }: Route.ComponentProps) {
  return (
    <>
      <Menu documentId={params.documentId} />
      <Outlet />
    </>
  );
}
