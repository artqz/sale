import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, Link } from "react-router";
import { toast } from "sonner";

import { AuthLayout } from "~/components/AuthLayout";
import { InputField, LoadingButton } from "~/components/Forms";
import { useIsPending } from "~/hooks/useIsPending";
import { authClient } from "~/utils/auth/auth.client";
import { AppInfo } from "~/utils/config";
import { forgetPasswordSchema } from "~/utils/validations/auth";
import type { Route } from "./+types/forgetPassword";

export const meta: Route.MetaFunction = () => {
  return [{ title: `Forgot your password? - ${AppInfo.name}` }];
};

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: forgetPasswordSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { error } = await authClient.forgetPassword({
    email: submission.value.email,
    redirectTo: "/auth/reset-password",
  });

  return error
    ? toast.error(error.message || "An unexpected error occurred.")
    : toast.success("Password reset link sent to your email!");
}

export default function ForgetPasswordRoute() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: forgetPasswordSchema });
    },
    constraint: getZodConstraint(forgetPasswordSchema),
    shouldRevalidate: "onInput",
  });

  const isPending = useIsPending({
    formMethod: "POST",
  });

  return (
    <AuthLayout
      title="Forgot your password?"
      description="Enter your email address and we will send you a password reset link."
    >
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <InputField
          inputProps={{
            ...getInputProps(fields.email, { type: "email" }),
            placeholder: "Enter your email",
            autoComplete: "email",
          }}
          errors={fields.email.errors}
        />
        <LoadingButton
          buttonText="Send reset link"
          loadingText="Sending reset link..."
          isPending={isPending}
        />
      </Form>

      <div className="text-center text-sm">
        <Link to="/auth/sign-in" className="text-primary hover:underline">
          ← Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
