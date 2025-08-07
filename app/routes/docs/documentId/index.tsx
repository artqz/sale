import { documentEditSchema } from "~/utils/validations/documents";
import { Form, useNavigation } from "react-router";
import { db } from "~/db/db.server";
import { document as schemaDocument, user as schemaUser, file as schemaFile } from "~/db/schema";
import { eq } from "drizzle-orm";
import { MultiFileUploader } from "~/components/documents/FileUploader";
import { ComboboxField, InputField, LoadingButton, SearchableComboboxField } from "~/components/Forms";
import { DOCUMENT_TYPE_ORD } from "~/utils/types";
import { dataWithSuccess } from "remix-toast";
import type { Route } from "./+types";
import { useState } from "react";
import React from "react";
import { Button } from "~/components/ui/Button";
import { DocumentStatus } from "~/components/documents/DocumentStatus";

// Опции для типов документов
const DOCUMENT_TYPE_OPTIONS = Object.entries(DOCUMENT_TYPE_ORD).map(
  ([value, label]) => ({ value, label })
);

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: `Документ: ${loaderData?.document?.title || "Неизвестный"}` },
    { name: "description", content: "Просмотр и редактирование документа" },
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
  
  console.log("Action вызван с данными:", {
    title: formData.get("title"),
    type: formData.get("type"),
    registrationNumber: formData.get("registrationNumber"),
    executor: formData.get("executor"),
    relatedDocument: formData.get("relatedDocument"),
  });
  
  // Парсим данные формы
  const title = formData.get("title") as string;
  const type = formData.get("type") as string;
  const registrationNumber = formData.get("registrationNumber") as string;
  const executor = formData.get("executor") as string;
  const relatedDocument = formData.get("relatedDocument") as string;

  // Валидируем данные с новой схемой
  const validationResult = documentEditSchema.safeParse({
    title,
    type,
    registrationNumber,
    executor,
    relatedDocument,
  });

  if (!validationResult.success) {
    console.log("Ошибка валидации:", validationResult.error.flatten().fieldErrors);
    return { success: false, errors: validationResult.error.flatten().fieldErrors };
  }

  try {
    console.log("Обновляем документ в БД...");
    await db
      .update(schemaDocument)
      .set({
        title: validationResult.data.title,
        type: validationResult.data.type,
        registrationNumber: validationResult.data.registrationNumber,
        // Пока не добавляем executorId и relatedDocumentId, так как их нет в схеме
      })
      .where(eq(schemaDocument.id, params.documentId));

    console.log("Документ успешно обновлен");
    return dataWithSuccess(`/docs/${params.documentId}`, "Документ успешно сохранён");
  } catch (error) {
    console.error("Error updating document:", error);
    return { success: false, error: "Ошибка при сохранении документа" };
  }
}

export default function DocumentViewRoute({ loaderData }: Route.ComponentProps) {
  const { document, users } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== "idle";

  // Проверяем, можно ли редактировать документ
  const canEdit = document.status === "DRAFT";

  // Состояние формы
  const [formData, setFormData] = useState({
    title: document.title,
    type: document.type,
    registrationNumber: document.registrationNumber,
    executor: "",
    relatedDocument: "",
  });

  // Обработчики изменений (работают только если можно редактировать)
  const handleInputChange = (field: string, value: string) => {
    if (!canEdit) return;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Обработка успешного сохранения
  React.useEffect(() => {
    if (navigation.state === "idle" && navigation.formData) {
      console.log("Форма отправлена успешно");
    }
  }, [navigation.state]);

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-4">
        {/* Заголовок и статус */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="text-sm"
            >
              ← Назад
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h1>
          </div>
          <DocumentStatus status={document.status} />
        </div>

        {/* Предупреждение для неактивных документов */}
        {!canEdit && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Внимание:</strong> Этот документ нельзя редактировать, так как его статус не является черновиком.
            </p>
          </div>
        )}

        <Form method="post" className="space-y-6">
          {/* Скрытые поля для передачи данных */}
          <input type="hidden" name="title" value={formData.title} />
          <input type="hidden" name="type" value={formData.type} />
          <input type="hidden" name="registrationNumber" value={formData.registrationNumber || ""} />
          <input type="hidden" name="executor" value={formData.executor} />
          <input type="hidden" name="relatedDocument" value={formData.relatedDocument} />

          {/* Основная сетка - 2 колонки */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Левая колонка */}
            <div className="space-y-6">
              
              {/* Реквизиты документа */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Реквизиты документа</h2>
                </div>
                <div className="p-4 space-y-4">
                  <InputField
                    labelProps={{ children: "Название документа" }}
                    inputProps={{
                      value: formData.title,
                      onChange: (e) => handleInputChange("title", e.target.value),
                      autoComplete: "off",
                      enterKeyHint: "next",
                      required: true,
                      disabled: !canEdit,
                    }}
                    errors={[]}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ComboboxField
                      labelProps={{ children: "Тип документа" }}
                      comboboxProps={{
                        name: "type",
                        value: formData.type,
                        onChange: (value) => handleInputChange("type", value),
                        options: DOCUMENT_TYPE_OPTIONS,
                        required: true,
                        placeholder: "Выберите тип",
                        disabled: !canEdit,
                      }}
                      errors={[]}
                    />

                    <InputField
                      labelProps={{ children: "Регистрационный номер" }}
                      inputProps={{
                        value: formData.registrationNumber || "",
                        onChange: (e) => handleInputChange("registrationNumber", e.target.value),
                        autoComplete: "off",
                        enterKeyHint: "next",
                        required: true,
                        disabled: !canEdit,
                      }}
                      errors={[]}
                    />
                  </div>
                </div>
              </div>

              {/* От кого / Кому */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Участники</h2>
                </div>
                <div className="p-4 space-y-4">
                  <SearchableComboboxField
                    labelProps={{ children: "Исполнитель" }}
                    comboboxProps={{
                      name: "executor",
                      value: formData.executor,
                      onChange: (value) => handleInputChange("executor", value),
                      searchType: "users",
                      placeholder: "Выберите исполнителя",
                      searchPlaceholder: "Поиск по имени или email",
                      emptyMessage: "Исполнители не найдены",
                      required: false,
                      disabled: !canEdit,
                    }}
                    errors={[]}
                  />

                  <SearchableComboboxField
                    labelProps={{ children: "Связанный документ" }}
                    comboboxProps={{
                      name: "relatedDocument",
                      value: formData.relatedDocument,
                      onChange: (value) => handleInputChange("relatedDocument", value),
                      searchType: "documents",
                      placeholder: "Выберите документ",
                      searchPlaceholder: "Поиск по названию или номеру",
                      emptyMessage: "Документы не найдены",
                      required: false,
                      disabled: !canEdit,
                    }}
                    errors={[]}
                  />
                </div>
              </div>

            </div>

            {/* Правая колонка */}
            <div className="space-y-6">
              
              {/* Вложения */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Вложения</h2>
                </div>
                <div className="p-4">
                  <MultiFileUploader documentId={document.id} files={document.files} />
                </div>
              </div>

              {/* Дополнительная информация */}
              <div className="bg-white rounded-lg border shadow-sm">
                <div className="px-4 py-3 border-b bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900">Информация</h2>
                </div>
                <div className="p-4 space-y-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Создан:</span> {new Date(document.createdAt).toLocaleString('ru-RU')}
                  </div>
                  <div>
                    <span className="font-medium">Обновлен:</span> {new Date(document.updatedAt).toLocaleString('ru-RU')}
                  </div>
                  <div>
                    <span className="font-medium">Статус:</span> {document.status}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Назад
            </Button>

            <div className="flex gap-3">
              {canEdit ? (
                <LoadingButton
                  type="submit"
                  buttonText="Сохранить изменения"
                  loadingText="Сохранение..."
                  isPending={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                />
              ) : (
                <Button
                  type="button"
                  disabled
                  className="bg-gray-400 cursor-not-allowed"
                >
                  Редактирование недоступно
                </Button>
              )}
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}