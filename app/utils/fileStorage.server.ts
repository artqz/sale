import { LocalFileStorage } from "@remix-run/file-storage/local";

export const fileStorage = new LocalFileStorage(
  "../../public/docs",
);

export function getStorageKey(fileId: string) {
  return fileId;
}