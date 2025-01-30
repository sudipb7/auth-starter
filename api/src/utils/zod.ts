import { ZodError } from "zod";

export function getZodError(error: ZodError) {
  return error.errors[0]?.message ?? "Invalid data";
}
