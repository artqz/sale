import {
  data,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { getToast } from "remix-toast";
import type { Route } from "./+types/root";
import "./app.css";
import { requestMiddleware } from "./utils/http.server";
import { parseColorScheme } from "./utils/colorScheme/server";
import { getPublicEnv } from "./utils/env.server";
import { GeneralErrorBoundary } from "./components/ErrorBoundary";
import { useNonce } from "./hooks/useNonce";
import { useEffect } from "react";
import { Toaster, toast as notify } from "sonner";
import {
  ColorSchemeScript,
  useColorScheme,
} from "./utils/colorScheme/components";
import { ProgressBar } from "./components/ProgressBar";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&display=swap",
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  await requestMiddleware(request);
  const colorScheme = await parseColorScheme(request);
  const { toast, headers } = await getToast(request);

  return data({ ENV: getPublicEnv(), colorScheme, toast }, { headers });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();
  const colorScheme = useColorScheme();

  return (
    <html
      lang="en"
      className={`${
        colorScheme === "dark" ? "dark" : ""
      } touch-manipulation overflow-x-hidden`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <Meta />
        <Links />
        <ColorSchemeScript nonce={nonce} />
      </head>
      <body>
        <ProgressBar />
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster position="top-center" theme={colorScheme} />
      </body>
    </html>
  );
}

export default function App({ loaderData }: Route.ComponentProps) {
  const { ENV, toast } = loaderData;
  const nonce = useNonce();

  useEffect(() => {
    if (toast?.type === "error") {
      notify.error(toast.message);
    }
    if (toast?.type === "success") {
      notify.success(toast.message);
    }
  }, [toast]);

  return (
    <>
      <Outlet />
      <script
        nonce={nonce}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify(ENV)}`,
        }}
      />
    </>
  );
}

export function ErrorBoundary() {
  return <GeneralErrorBoundary />;
}
