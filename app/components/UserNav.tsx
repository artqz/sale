import { useNavigate, useSubmit } from "react-router";

import {
  CircleGaugeIcon,
  HomeIcon,
  LogOutIcon,
  UserCogIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/DropdownMenu";
import { useAuthUser } from "~/hooks/useAuthUser";
import { getAvatarUrl } from "~/utils/common";
import { Button } from "./ui/Button";

export function UserNav() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const submit = useSubmit();
  const { avatarUrl, placeholderUrl } = getAvatarUrl(user.image, user.name);
  const initials = user?.name?.slice(0, 2);
  const alt = user?.name ?? "User avatar";
  const avatar = avatarUrl || placeholderUrl;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={avatar} alt={alt} />
            <AvatarFallback className="font-bold text-xs uppercase">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatar} alt={alt} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-muted-foreground text-xs">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            navigate("/");
          }}
        >
          <HomeIcon />
          Home Page
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            navigate("/settings/account");
          }}
        >
          <UserCogIcon />
          Account Settings
        </DropdownMenuItem>
        {/* Todo: coming soon */}
        <DropdownMenuItem disabled>
          <CircleGaugeIcon />
          Admin Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            setTimeout(() => {
              submit(null, { method: "POST", action: "/auth/sign-out" });
            }, 100);
          }}
        >
          <LogOutIcon />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
