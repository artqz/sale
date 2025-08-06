import z from "zod";

export const DocumentType = z.enum([
  "INCOMING",     // Входящий документ
  "OUTGOING",     // Исходящий документ
  "REGULATORY",   // Нормативный документ
  "INTERNAL",     // Внутренний документ
  "MEMORANDUM"    // Служебная записка
])
export type DocumentType = z.infer<typeof DocumentType>;

export const DOCUMENT_TYPE_ORD: Record<DocumentType, string> = {
  "INCOMING": "Входящий документ",
  "OUTGOING": "Исходящий документ",
  "REGULATORY": "Нормативный документ",
  "INTERNAL": "Внутренний документ",
  "MEMORANDUM": "Служебная записка"
};