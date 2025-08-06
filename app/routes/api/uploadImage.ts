import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!file || typeof file === "string") return { error: "No file" };

  const ext = file.name.split(".").pop();
  const fileName = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "deals");
  const filePath = path.join(uploadDir, fileName);

  await writeFile(filePath, Buffer.from(await file.arrayBuffer()));
  return { url: `/deals/${fileName}` };
}; 