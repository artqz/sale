import type { Route } from "./+types/home";
import { useAuthUser } from "~/hooks/useAuthUser";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function HomeRoute(_: Route.ComponentProps) {
  const { user } = useAuthUser();

  return (
    <>
      <header className="space-y-2">
        <h2 className="font-semibold text-base">
          <span className="mr-2 text-xl">👋</span> Hi, {user.name}!
        </h2>
        <p className="text-muted-foreground">
          Welcome to your dashboard. Here you can manage your todos and account
          settings.
        </p>
      </header>
    </>
  );
}
