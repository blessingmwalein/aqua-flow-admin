import * as yup from "yup";

export const rejectDriverSchema = yup.object({
  reason: yup
    .string()
    .max(500, "Reason must be at most 500 characters")
    .optional(),
});

export type RejectDriverFormValues = yup.InferType<typeof rejectDriverSchema>;
