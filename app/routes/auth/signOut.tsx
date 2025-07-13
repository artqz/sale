import { redirect } from "react-router";
import { authClient } from "~/utils/auth/auth.client";

export async function loader() {
  return redirect("/auth/sign-in");
}

export async function clientAction() {
  await authClient.signOut();
  return redirect("/auth/sign-in");
}
