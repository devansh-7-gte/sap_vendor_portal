const { z } = require('zod');

const asnItemSchema = z.object({
  line: z.coerce.number().int().positive(),
  shippedQuantity: z.coerce.number().positive(),
  materialCode: z.string().optional(),
  description: z.string().optional(),
  uom: z.string().optional()
});

const asnCreateSchema = z.object({
  carrierName: z.string().optional(),
  trackingNumber: z.string().optional(),
  vehicleNumber: z.string().optional(),
  invoiceReference: z.string().optional(),
  ewayBillNo: z.string().optional(),
  shipDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid shipDate format" }).optional(),
  estimatedDeliveryDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid estimatedDeliveryDate format" }).optional(),
  items: z.array(asnItemSchema).min(1),
  documentIds: z.array(z.string()).optional()
});

module.exports = {
  asnCreateSchema
};
