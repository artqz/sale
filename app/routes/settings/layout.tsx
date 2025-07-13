import { Outlet } from "react-router";

import { Menu } from "~/components/settings/SettingMenu";
import type { Route } from "./+types/layout";

export default function Layout(_: Route.ComponentProps) {
  return (
    <>
      <Menu />
      <Outlet />
    </>
  );
}
