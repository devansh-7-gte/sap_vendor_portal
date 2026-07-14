const { z } = require('zod');

const invoiceItemSchema = z.object({
  line: z.coerce.number().int().positive(),
  materialCode: z.string().min(1),
  description: z.string().optional(),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().positive(),
  amount: z.coerce.number().positive().optional()
});

const invoiceCreateSchema = z.object({
  grnId: z.string().min(1),
  invoiceNumber: z.string().min(1),
  invoiceDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid invoiceDate format" }),
  subTotal: z.coerce.number().positive().optional(),
  taxAmount: z.coerce.number().min(0).optional(),
  totalAmount: z.coerce.number().positive(),
  items: z.array(invoiceItemSchema).min(1)
});

module.exports = {
  invoiceCreateSchema
};
