import { db } from "~/db/db.server";
import { document as schemaDocument, user as schemaUser, file as schemaFile } from "~/db/schema";
import { eq } from "drizzle-orm";
import { DOCUMENT_TYPE_ORD } from "~/utils/types";
import type { Route } from "./+types";
import { Link } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Просмотр документа" },
    { name: "description", content: "Просмотр документа" },
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

    const [author] = await tx
      .select()
      .from(schemaUser)
      .where(eq(schemaUser.id, document.userId))
      .limit(1);

    const files = await tx.select().from(schemaFile).where(eq(schemaFile.documentId, document.id));

    return { document: { ...document, files }, author };
  });
}

export default function DocumentViewRoute({ loaderData }: Route.ComponentProps) {
  const { document, author } = loaderData;
  const documentType = DOCUMENT_TYPE_ORD[document.type as keyof typeof DOCUMENT_TYPE_ORD];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/docs" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Назад к документам
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {document.title}
            </h1>
          </div>
          <Link 
            to={`/docs/${document.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Редактировать
          </Link>
        </div>
      </div>

      {/* Document Card - Full Height */}
      <div className="flex-1 p-6 bg-gray-50 overflow-auto">
        <div className="h-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden flex flex-col">
          {/* Document Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название документа
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {document.title}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Тип документа
                  </label>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {documentType}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Регистрационный номер
                  </label>
                  <p className="text-lg font-mono text-gray-900">
                    {document.registrationNumber || "Не указан"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Автор
                  </label>
                  <p className="text-lg text-gray-900">
                    {author?.name || "Не указан"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Document Content */}
          <div className="flex-1 p-6 space-y-8 overflow-auto">
            {/* От кого */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                От кого
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 italic">
                  Информация не заполнена
                </p>
              </div>
            </div>

            {/* Кому */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Кому
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 italic">
                  Информация не заполнена
                </p>
              </div>
            </div>

            {/* Вложения */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Вложения ({document.files.length})
              </h3>
              {document.files.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {document.files.map((file) => (
                    <div
                      key={file.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {file.size ? `${Math.round(file.size / 1024)} KB` : 'Размер неизвестен'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Нет вложений</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    К этому документу не прикреплены файлы
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div>
                Создано: {new Date(document.createdAt).toLocaleDateString('ru-RU')}
              </div>
              <div>
                Обновлено: {new Date(document.updatedAt).toLocaleDateString('ru-RU')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}