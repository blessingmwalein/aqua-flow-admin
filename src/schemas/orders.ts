import * as yup from "yup";

export const cancelOrderSchema = yup.object({
  note: yup.string().optional(),
});

export type CancelOrderFormValues = yup.InferType<typeof cancelOrderSchema>;
