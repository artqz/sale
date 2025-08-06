import z from "zod";

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg", 
  "image/png",
  "image/webp",
];

export const addDealSchema = z.object({
  name: z
    .string({ message: "Name is required." })
    .min(3, "Name must be at least 3 characters long.")
    .trim(),
  url: z
    .string({ message: "URL is required." })
    .min(3, "URL must be at least 3 characters long.")
    .trim(),
  body: z
    .string({ message: "Body is required." })
    .min(3, "Body must be at least 3 characters long.")
    .trim(),
  image: z
    .instanceof(File)
    .refine((file) => !file || file.size === 0 || file.size <= MAX_FILE_SIZE, 
      `Max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported.")
    .optional(),
});
