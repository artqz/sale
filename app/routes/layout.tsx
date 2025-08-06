import { CircleFadingPlusIcon } from "lucide-react";
import { Link, Outlet, data, href } from "react-router";
import { ColorSchemeToggle } from "~/components/ColorSchemeToggle";
import { UserNav } from "~/components/UserNav";
import { authSessionContext } from "~/utils/contexts";
import { authMiddleware } from "~/middlewares/authGuard.server";
import type { Route } from "./+types/layout";
import { Button } from "~/components/ui/Button";
import { useAddDocument } from "~/utils/documents.tsx/components";

export const unstable_middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(authSessionContext);
  return data(authSession);
}

export default function AuthenticatedLayout(_: Route.ComponentProps) {
  const addDocument = useAddDocument();
  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between p-4 sm:px-10">
          <Link to={href("/")} className="flex items-center gap-2">
            LOGO
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <div onClick={() => addDocument()}>
                <CircleFadingPlusIcon />
              </div>
            </Button>
            <ColorSchemeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:p-10">
        <Outlet />
      </main>
    </>
  );
}
