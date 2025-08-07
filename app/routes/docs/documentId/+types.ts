import type { Route as BaseRoute } from "@react-router/dev";

export namespace Route {
  export type MetaArgs = BaseRoute.MetaArgs;
  export type LoaderArgs = BaseRoute.LoaderArgs;
  export type ActionArgs = BaseRoute.ActionArgs;
  export type ComponentProps = BaseRoute.ComponentProps;
}