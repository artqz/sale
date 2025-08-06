import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import { buildImportMap } from "lexical";
import path from "path";
import { useRef, useState } from "react";
import { Form, redirect } from "react-router";
import { SharedHistoryContext } from "~/components/editor/context/SharedHistoryContext";
import Editor from "~/components/editor/Index.client";
import { InputField, LoadingButton } from "~/components/Forms";

import { db } from "~/db/db.server";
import { deal as dealTable } from "~/db/schema";
import { useIsPending } from "~/hooks/useIsPending";
import { generateSlug } from "~/utils/common";
import { getAuthSession } from "~/utils/middlewares/authGuard.server";
import { addDealSchema } from "~/utils/validations/deals";

export default function AddDealRoute() {
  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addDealSchema });
    },
    constraint: getZodConstraint(addDealSchema),
    shouldRevalidate: "onInput",
  });

  const isPending = useIsPending({ formMethod: "POST" });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const bodyInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Добавить скидку</h1>
      <Form method="post" className="grid gap-4" {...getFormProps(form)} encType="multipart/form-data">
        <InputField
          labelProps={{ children: "Заголовок" }}
          inputProps={{
            ...getInputProps(fields.name, { type: "text" }),
            placeholder: "Название товара или скидки",
            autoComplete: "name",
            enterKeyHint: "next",
            required: true,
          }}
          errors={fields.name.errors}
        />
        <InputField
          labelProps={{ children: "Ссылка на скидку" }}
          inputProps={{
            ...getInputProps(fields.url, { type: "text" }),
            placeholder: "http://example.ru/item",
            autoComplete: "url",
            enterKeyHint: "next",
          }}
          errors={fields.url.errors}
        />
        
        {/* Поле для загрузки изображения */}
        <div className="flex flex-col gap-2">
          <label htmlFor="image" className="text-sm font-medium">
            Изображение (опционально)
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {previewImage && (
            <div className="mt-2">
              <img
                src={previewImage}
                alt="Предварительный просмотр"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="body" className="text-sm font-medium">
            Описание скидки
          </label>
          <input
            ref={bodyInputRef}
            {...getInputProps(fields.body, { type: "hidden" })}
          />
         
          <SharedHistoryContext>
          <Editor />
          </SharedHistoryContext>
          
          {fields.body.errors && (
            <div className="text-red-600 text-sm">
              {fields.body.errors.join(', ')}
            </div>
          )}
        </div>

        <LoadingButton 
          buttonText="Добавить скидку" 
          loadingText="Добавление..." 
          isPending={isPending}
          onClick={() => {
            // Убеждаемся, что значение поля обновлено перед отправкой
            if (bodyInputRef.current) {
              bodyInputRef.current.dispatchEvent(new Event('input', { bubbles: true }));
            }
          }}
        />
      </Form>
    </div>
  );
}

export const action = async ({ request }: { request: Request }) => {
  try {
    const formData = await request.formData();
    const submission = parseWithZod(formData, { schema: addDealSchema });

    if (submission.status !== "success") {
      return submission.reply();
    }

    const authSession = await getAuthSession(request);
    if (!authSession) {
      return redirect("/auth/sign-in");
    }

    const { name, url, body, image } = submission.value;
    
    // Генерируем слаг из заголовка
    const slug = generateSlug(name);
    
    let imageUrl: string | null = null;
    
    // Обработка загрузки изображения
    if (image && image.size > 0) {
      try {
        const fileExtension = image.type.split("/")[1];
        const fileName = `${randomUUID()}.${fileExtension}`;
        
        // Путь для сохранения
        const uploadDir = path.join(process.cwd(), "public", "deals");
        const filePath = path.join(uploadDir, fileName);
        
        // Создаем папку, если её нет
        await fs.mkdir(uploadDir, { recursive: true });
        
        // Сохраняем файл
        const fileBuffer = await image.arrayBuffer();
        await fs.writeFile(filePath, Buffer.from(fileBuffer));
        
        // Относительный URL для сохранения в БД
        imageUrl = `/deals/${fileName}`;
      } catch (error) {
        console.error("Error uploading image:", error);
        // Продолжаем без изображения, если загрузка не удалась
      }
    }
    
    await db.insert(dealTable).values({
      title: name,
      slug: slug,
      body: body,
      image: imageUrl,
      userId: authSession.user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return redirect("/deals");
  } catch (error) {
    console.error("Error in deal action:", error);
    return { error: "An unexpected error occurred." };
  }
};
