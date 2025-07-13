import { MonitorIcon, SmartphoneIcon } from "lucide-react";

import type { authClient } from "~/utils/auth/auth.client";
import { formatDate, parseUserAgent } from "~/utils/utils";

export function SessionItem({
  session,
  currentSessionToken,
}: {
  session: typeof authClient.$Infer.Session.session;
  currentSessionToken: string;
}) {
  const { system, browser, isMobile } = parseUserAgent(session.userAgent || "");
  const isCurrentSession = session.token === currentSessionToken;

  return (
    <div className="flex w-full items-center justify-between gap-4 px-4 py-3">
      <div className="flex-shrink-0">
        {isMobile ? (
          <SmartphoneIcon className="size-4 text-muted-foreground" />
        ) : (
          <MonitorIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <span className="font-mono">
            {system}
            <small className="mx-1 text-muted-foreground">•</small>
            {browser}
          </span>
          {isCurrentSession && (
            <span className="flex h-3 flex-shrink-0 items-center gap-1 rounded-md border border-primary px-0.5 text-primary text-xs sm:h-auto sm:px-1.5">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="hidden sm:inline">Current device</span>
            </span>
          )}
        </div>

        <div className="space-x-2 text-muted-foreground text-xs">
          <span>IP Address: {session.ipAddress || "unknown"}</span>
          <span>
            Last active: {formatDate(session.createdAt, "MMM d, yyyy hh:mm a")}
          </span>
        </div>
      </div>
    </div>
  );
}
