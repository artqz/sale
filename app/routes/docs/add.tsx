import { getFormProps, getInputProps, getSelectProps, useForm } from "@conform-to/react";
import type { Route } from "./+types/add";
import { documentSchema } from "~/utils/validations/documents";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, redirect, useNavigation } from "react-router";
import { InputField, LoadingButton, SelectField } from "~/components/Forms";
import { DOCUMENT_TYPE_ORD } from "~/utils/types";
import { toast } from "sonner";
import { db } from "~/db/db.server";
import { document } from "~/db/schema";
import { authSessionContext } from "~/utils/contexts";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_ORD).map(
  ([value, label]) => ({ value, label })
);

export async function action({ request, context }: Route.ActionArgs) {
  const authSession = context.get(authSessionContext);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: documentSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await db.insert(document).values({
    title: submission.value.title,
    type: submission.value.type,
    registrationNumber: submission.value.registrationNumber,
    userId: authSession.user.id
  });


  // const { error } = await authClient.signUp.email({
  //   callbackURL: "/",
  //   ...submission.value,
  // });

  // if (error) {
  //   return toast.error(error.message || "An unexpected error occurred.");
  // }

  toast.success(
    "Документ успешно добавлен"
  );
  return redirect("/");
}

export default function DocumentAddRoute(_: Route.ComponentProps) {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: documentSchema });
    },
    constraint: getZodConstraint(documentSchema),
    shouldRevalidate: "onInput",
  });

  const navigation = useNavigation();
  const isPending = (provider: string) =>
    navigation.formData?.get("provider") === provider &&
    navigation.state !== "idle";
  const isSignInPending = isPending("sign-in");

  return (
    <>
      <header className="space-y-2">
        <h2 className="font-semibold text-base">
          Add
        </h2>

      </header>
      <Form method="post" className="grid gap-4" {...getFormProps(form)}>
        <InputField
          labelProps={{ children: "Название документа" }}
          inputProps={{
            ...getInputProps(fields.title, { type: "text" }),
            placeholder: "Название документа",
            autoComplete: "title",
            enterKeyHint: "next",
            required: true,
          }}
          errors={fields.title.errors}
        />
        <SelectField labelProps={{ children: "Тип документа" }} selectProps={{
          ...getSelectProps(fields.type), placeholder: "Тип документа",
          autoComplete: "type",
          enterKeyHint: "next",
          required: true,
        }}
          options={DOCUMENT_TYPE_OPTIONS}
          errors={fields.type.errors}
        />
        <InputField
          labelProps={{ children: "Регистрационный номер" }}
          inputProps={{
            ...getInputProps(fields.registrationNumber, { type: "text" }),
            placeholder: "Регистрационный номер",
            autoComplete: "registrationNumber",
            enterKeyHint: "next",
            required: true,
          }}
          errors={fields.registrationNumber.errors}
        />
        <LoadingButton
          buttonText="Sign In"
          loadingText="Signing in..."
          isPending={isSignInPending}
        />
      </Form>
    </>
  );
}
