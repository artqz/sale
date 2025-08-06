import { CircleFadingPlusIcon } from "lucide-react";
import { data, href, Link, Outlet } from "react-router";
import { ColorSchemeToggle } from "~/components/ColorSchemeToggle";
import { UserNav } from "~/components/UserNav";
import { Button } from "~/components/ui/Button";
import { authSessionContext } from "~/utils/contexts";
import { authMiddleware } from "~/utils/middlewares/authGuard.server";
import type { Route } from "./+types/layout";

export const unstable_middleware = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const authSession = context.get(authSessionContext);
  return data(authSession);
}

export default function AuthenticatedLayout(_: Route.ComponentProps) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md">
        <div className="flex w-full items-center justify-between p-4 sm:px-10">
          <Link to={href("/")} className="flex items-center gap-2">
            LOGO
          </Link>
          <nav className="flex items-center gap-6">
            <Link 
              to="/deals" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Скидки
            </Link>
            <Link 
              to="/forum" 
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Форум
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/deals/add">
                <CircleFadingPlusIcon />
              </Link>
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
