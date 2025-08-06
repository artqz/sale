import fs from "fs/promises"
import path from "path";
import type { Route } from "./+types/upload";
import { parseWithZod } from "@conform-to/zod";
import { filesDocumentSchema, getFileExtension } from "~/utils/validations/documents";
import { randomUUID } from "crypto";
import { db } from "~/db/db.server";
import { file as schemaFile } from "~/db/schema";
import { data } from "react-router";



export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const documentId = params.documentId
  console.log(formData);

  // Валидация данных формы
  const submission = parseWithZod(formData, { schema: filesDocumentSchema });

  if (submission.status !== "success") {
    return submission;
  }

  const files = submission.value.files;
  const uploadDir = path.join(process.cwd(), "public", "documents", documentId);
  const savedFiles = [];

  try {
    // Создаем директорию, если её нет
    await fs.mkdir(uploadDir, { recursive: true });

    // Обрабатываем каждый файл
    for (const file of files) {
      // Получаем тип 
      const type = formData.get('fileType') as 'MAIN' | 'ATTACHMENT' | 'SCAN';
      // Получаем правильное расширение файла
      const extension = getFileExtension(file.type as any);
      const fileName = `${randomUUID()}${extension}`;
      const filePath = path.join(uploadDir, fileName);

      // Сохраняем файл на диск
      const fileBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, Buffer.from(fileBuffer));

      // Сохраняем информацию о файле в БД
      await db.insert(schemaFile).values({
        name: file.name,
        documentId,
        type,
        path: `/documents/${documentId}/${fileName}`,
        size: file.size,
        mimeType: file.type,
        extension: extension.substring(1)
      });

      savedFiles.push({
        originalName: file.name,
        savedName: fileName,
        path: `/documents/${documentId}/${fileName}`,
      });
    }

    return data({
      success: true,
      files: savedFiles,
    }, { status: 200 });
  } catch (error) {
    // Удаляем уже сохраненные файлы в случае ошибки
    for (const file of savedFiles) {
      try {
        await fs.unlink(path.join(uploadDir, file.savedName));
      } catch (unlinkError) {
        console.error("Failed to delete file:", file.savedName, unlinkError);
      }
    }

    return data(
      {
        success: false,
        error: "Произошла ошибка при сохранении файлов",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}



// if (!file) {
//   throw new Response("File not found", {
//     status: 404,
//   });
// }

// return new Response(file.stream(), {
//   status: 200,
//   headers: {
//     "Content-Type": file.type,
//     "Content-Disposition": `attachment; filename=${file.name}`,
//   },
// });
