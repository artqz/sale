import { parseWithZod } from "@conform-to/zod";
import { data, redirect } from "react-router";
import { ColorSchemeSchema } from "~/utils/colorScheme/components";
import { serializeColorScheme } from "~/utils/colorScheme/server";
import type { Route } from "./+types/colorScheme";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.clone().formData();
  const submission = parseWithZod(formData, { schema: ColorSchemeSchema });

  if (submission.status !== "success") {
    throw data("Invalid color scheme", { status: 400 });
  }

  const { colorScheme, returnTo } = submission.value;
  return redirect(returnTo || "/", {
    headers: {
      "Set-Cookie": await serializeColorScheme(colorScheme),
    },
  });
}
