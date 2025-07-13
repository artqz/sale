import fs from "fs/promises";
import path from "path";
import { parseWithZod } from "@conform-to/zod";
import { dataWithError, dataWithSuccess } from "remix-toast";
import AvatarCropper from "~/components/AvatarCropper";
import { DeleteAccount, SignOut } from "~/components/settings/AccountAction";
import { SettingRow } from "~/components/settings/SettingRow";
import { SettingsLayout } from "~/components/settings/SettingLayout";
import { useAuthUser } from "~/hooks/useAuthUser";
import {
  deleteUserImageFromStorage,
  serverAuth,
} from "~/utils/auth/auth.server";
import { AppInfo } from "~/utils/config";
import { authSessionContext } from "~/utils/contexts";
import { getAvatarUrl } from "~/utils/utils";
import { accountSchema } from "~/utils/validations/settings";
import type { Route } from "./+types/account";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Account - ${AppInfo.name}` }];
};

export async function action({ request, context }: Route.ActionArgs) {
  try {
    const formData = await request.clone().formData();
    const submission = parseWithZod(formData, { schema: accountSchema });

    if (submission.status !== "success") {
      return dataWithError(null, "Invalid form data.");
    }

    const auth = serverAuth();
    const headers = request.headers;
    const { user } = context.get(authSessionContext);
    const { intent } = submission.value;
    let message = "";

    switch (intent) {
      case "delete-account":
        await Promise.all([
          auth.api.revokeSessions({ headers }),
          auth.api.deleteUser({ body: {}, asResponse: false, headers }),
        ]);
        message = "Account deleted.";
        break;

      case "delete-avatar": {
        if (!user.image) {
          return dataWithError(null, "No avatar to delete.");
        }

        await Promise.all([
          deleteUserImageFromStorage(user.image),
          auth.api.updateUser({
            body: { image: undefined },
            asResponse: false,
            headers,
          }),
        ]);
        message = "Avatar deleted.";
        break;
      }

      case "set-avatar": {
        const image = submission.value.image;
        const fileExtension = image.type.split("/")[1];

        // Генерируем имя файла
        const fileName = `${user.id}.${fileExtension}`;

        // Путь для сохранения (создайте папку public/uploads заранее)
        const uploadDir = path.join(process.cwd(), "public", "avatars");
        const filePath = path.join(uploadDir, fileName);

        // Создаем папку, если её нет
        await fs.mkdir(uploadDir, { recursive: true });

        // Сохраняем файл
        const fileBuffer = await image.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));

        // Относительный URL для сохранения в БД
        const imagePath = `/avatars/${fileName}`;

        await auth.api.updateUser({
          body: { image: imagePath },
          asResponse: true,
          headers,
        });

        message = "Avatar updated.";
        break;
      }

      default:
        return dataWithError(null, "Invalid intent.");
    }

    return dataWithSuccess(null, message);
  } catch (error) {
    console.error("Account action error:", error);
    return dataWithError(null, "An unexpected error occurred.");
  }
}

export default function AccountRoute() {
  const { user } = useAuthUser();
  const { avatarUrl, placeholderUrl } = getAvatarUrl(user.image, user.name);

  return (
    <SettingsLayout title="Account">
      <SettingRow
        title="Avatar"
        description="Click avatar to change profile picture."
        action={
          <AvatarCropper
            avatarUrl={avatarUrl}
            placeholderUrl={placeholderUrl}
          />
        }
      />
      <SettingRow
        title="Name & Email address"
        description={`${user.name}, ${user.email}`}
      />
      <SettingRow
        title="Current sign in"
        description={`You are signed in as ${user.email}`}
        action={<SignOut />}
      />
      <SettingRow
        title="Delete account"
        description="Permanently delete your account."
        action={<DeleteAccount email={user.email} />}
      />
    </SettingsLayout>
  );
}
