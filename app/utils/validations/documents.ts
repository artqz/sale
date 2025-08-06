import { z } from "zod";

// Поддерживаемые MIME-типы
const ALLOWED_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed"
] as const;

// 2. Создаём union тип из значений массива
export type ALLOWED_MIME_TYPE = typeof ALLOWED_MIME_TYPES[number];

// 3. Функция для получения расширения файла
export function getFileExtension(mimeType: ALLOWED_MIME_TYPE): string {
  const extensionMap: Record<ALLOWED_MIME_TYPE, string> = {
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "application/vnd.ms-excel": ".xls",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
    "application/vnd.ms-powerpoint": ".ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
    "text/plain": ".txt",
    "application/pdf": ".pdf",
    "application/zip": ".zip",
    "application/x-zip-compressed": ".zip",
    "application/x-rar-compressed": ".rar",
    "application/x-7z-compressed": ".7z"
  };

  return extensionMap[mimeType];
}





export const filesDocumentSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .nonempty("Выберите хотя бы один файл")
    .transform(files =>
      files.filter(file =>
        file.size <= 10 * 1024 * 1024 && // 10MB лимит
        ALLOWED_MIME_TYPES.includes(file.type as any)
      )
    )
    .refine(
      files => files.length > 0,
      "Разрешены только: DOC/DOCX, XLS/XLSX, PPT/PPTX, PDF, ZIP/RAR/7Z (макс. 10MB)"
    ),
});

// Уточненная схема валидации документов
export const documentSchema = z.object({
  title: z.string()
    .min(3, "Название должно содержать минимум 3 символа")
    .max(200, "Название не должно превышать 200 символов"),

  type: z.enum([
    "INCOMING",     // Входящий документ
    "OUTGOING",     // Исходящий документ
    "REGULATORY",   // Нормативный документ
    "INTERNAL",     // Внутренний документ
    "MEMORANDUM"    // Служебная записка
  ]).describe("Тип документа"),

  registrationNumber: z.string()
    .max(50, "Рег. номер не может превышать 50 символов")
    .regex(/^[A-Za-z0-9\-_]+$/, "Только буквы, цифры, дефисы и подчеркивания"),

  files: z.array(
    z.object({
      name: z.string(),
      path: z.string().url("Некорректный URL вложения"),
      size: z.number().positive()
    })),
  // ).optional(),
  // content: z.string()
  //   .min(10, "Текст документа должен содержать минимум 10 символов")
  //   .max(10000, "Превышен максимальный размер документа"),

  // status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),

  // createdAt: z.date().optional().default(new Date()),

  // attachments: z.array(
  //   z.object({
  //     name: z.string(),
  //     url: z.string().url("Некорректный URL вложения"),
  //     size: z.number().positive()
  //   })
  // ).optional(),

  author: z.object({
    label: z.string(),
    value: z.string()
  })
});

// Тип для TypeScript
export type Document = z.infer<typeof documentSchema>;