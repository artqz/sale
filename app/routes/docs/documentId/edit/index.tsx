"use client"
import { getFormProps, getInputProps, getSelectProps, useForm, useField } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { documentSchema } from "~/utils/validations/documents";
import { Form, useNavigation } from "react-router";
import { db } from "~/db/db.server";
import { document as schemaDocument, user as schemaUser, file as schemaFile } from "~/db/schema";
import { eq } from "drizzle-orm";
import { MultiFileUploader } from "~/components/documents/FileUploader";
import { ComboboxField, InputField, LoadingButton, SelectField } from "~/components/Forms";
import { DOCUMENT_TYPE_ORD } from "~/utils/types";
import { dataWithSuccess } from "remix-toast";
import type { Route } from "./+types";
import { useState } from "react";

// Опции для типов документов
const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_ORD).map(
  ([value, label]) => ({ value, label })
);

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Редактирование документа" },
    { name: "description", content: "Форма редактирования документа" },
  ];
}

export async function loader({ params }: Route.LoaderArgs) {
  return await db.transaction(async (tx) => {
    const [document] = await tx
      .select()
      .from(schemaDocument)
      .where(eq(schemaDocument.id, params.documentId))
      .limit(1);

    if (!document) throw new Response("Документ не найден", { status: 404 });

    const users = await tx.select({ value: schemaUser.id, label: schemaUser.name }).from(schemaUser);
    const files = await tx.select().from(schemaFile).where(eq(schemaFile.documentId, document.id));

    return { document: { ...document, files }, users };
  });
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: documentSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  await db
    .update(schemaDocument)
    .set({
      title: submission.value.title,
      type: submission.value.type,
      registrationNumber: submission.value.registrationNumber,
      // authorId: submission.value.author, // если нужно
    })
    .where(eq(schemaDocument.id, params.documentId));

  return dataWithSuccess(null, "Документ успешно сохранён");
}

export default function DocumentEditRoute({ loaderData }: Route.ComponentProps) {
  const { document, users } = loaderData;
  const [authorValue, setAuthorValue] = useState(document.userId ?? "");
  const [typeValue, setTypeValue] = useState(document.type);
  // ✅ 1. Деструктурируем useForm
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: documentSchema });
    },
    constraint: getZodConstraint(documentSchema),
    shouldRevalidate: "onInput",
    defaultValue: {
      ...document,
    },
  });

  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";
  console.log(fields.author.name);

  return (
    <Form method="post" {...getFormProps(form)} className="space-y-8">
      <h2 className="text-xl font-semibold">Реквизиты документа</h2>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="grid gap-6">
          <InputField
            labelProps={{ children: "Название документа" }}
            inputProps={{
              ...getInputProps(fields.title, { type: "text" }),
              autoComplete: "off",
              enterKeyHint: "next",
              required: true,
            }}
            errors={fields.title.errors}
          />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <SelectField
                labelProps={{ children: "Тип документа" }}
                selectProps={{
                  ...getSelectProps(fields.type),
                  placeholder: "Выберите тип",
                  autoComplete: "off",
                  enterKeyHint: "next",
                  required: true,
                }}
                options={DOCUMENT_TYPE_OPTIONS}
                errors={fields.type.errors}
              />
              <ComboboxField
                labelProps={{ children: "Тип документа" }}
                comboboxProps={{
                  name: "type", // можно не передавать, но для ясности оставим
                  value: typeValue,
                  onInput: setTypeValue as any,
                  options: DOCUMENT_TYPE_OPTIONS,
                  required: true,
                }}
                errors={fields.author.errors}
              />

              {/* Скрытое поле — чтобы conform видел значение */}
              <input type="hidden" name="author" value={authorValue} />

              <ComboboxField
                labelProps={{ children: "Автор" }}
                comboboxProps={{
                  name: "author", // можно не передавать, но для ясности оставим
                  value: authorValue,
                  onInput: setAuthorValue,
                  options: users,
                  required: true,
                }}
                errors={fields.author.errors}
              />
            </div>

            <div className="space-y-4">
              <InputField
                labelProps={{ children: "Регистрационный номер" }}
                inputProps={{
                  ...getInputProps(fields.registrationNumber, { type: "text" }),
                  autoComplete: "off",
                  enterKeyHint: "next",
                  required: true,
                }}
                errors={fields.registrationNumber.errors}
              />

              {/* <InputField
                labelProps={{ children: "Дата регистрации" }}
                inputProps={{
                  ...getInputProps(fields.registrationDate, { type: "date" }), // ← если есть в схеме
                  autoComplete: "off",
                  enterKeyHint: "next",
                }}
                errors={fields.registrationDate?.errors}
              /> */}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-semibold">От кого</h2>
      <div className="rounded-lg border bg-white p-6 shadow-sm grid grid-cols-2 gap-6">
        <div className="space-y-4">123</div>
        <div className="space-y-4">123</div>
      </div>

      <h2 className="text-xl font-semibold">Кому</h2>
      <div className="rounded-lg border bg-white p-6 shadow-sm grid grid-cols-2 gap-6">
        <div className="space-y-4">123</div>
        <div className="space-y-4">123</div>
      </div>

      <h2 className="text-xl font-semibold">Вложения</h2>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <MultiFileUploader documentId={document.id} files={document.files} />
      </div>

      <div className="pt-4">
        <LoadingButton
          type="submit"
          buttonText="Сохранить документ"
          loadingText="Сохранение..."
          isPending={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        />
      </div>
    </Form>
  );
}