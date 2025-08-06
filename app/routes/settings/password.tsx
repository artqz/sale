import { parseWithZod } from "@conform-to/zod";
import { Link, href } from "react-router";
import { toast } from "sonner";

import { ChangePassword } from "~/components/settings/PasswordAction";
import { SettingRow } from "~/components/settings/SettingRow";
import { SettingsLayout } from "~/components/settings/SettingLayout";
import { authClient } from "~/utils/auth/auth.client";
import { AppInfo } from "~/utils/config";
import { cn } from "~/utils/common";
import { changePasswordSchema } from "~/utils/validations/auth";
import type { Route } from "./+types/password";
import { buttonVariants } from "~/components/ui/buttonVariants";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Password - ${AppInfo.name}` }];
};

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: changePasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const result = await authClient.changePassword({
    newPassword: submission.value.newPassword,
    currentPassword: submission.value.currentPassword,
    revokeOtherSessions: true,
  });

  if (result.error) {
    toast.error(result.error.message || "An unexpected error occurred.");
    return { status: "error" };
  }

  toast.success("Password changed successfully! Other sessions revoked.");
  return { status: "success" };
}

export default function ChangePasswordRoute() {
  return (
    <SettingsLayout title="Password">
      <SettingRow
        title="Change your password"
        description="If you have already set your password, you can update it here. If you have forgotten your password, please reset it below."
        action={<ChangePassword />}
      />
      <SettingRow
        title="Reset your password"
        description="If you have forgotten your password, you can reset it here. Alternatively, if have signed up via Github / Google and more, you can set your password here too."
        action={
          <Link
            target="_blank"
            to={href("/auth/forget-password")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Reset password ↗
          </Link>
        }
      />
    </SettingsLayout>
  );
}
