const { z } = require('zod');

const chatMessageSchema = z.object({
  message: z.string().min(1, { message: "Message content cannot be empty" }).max(1000, { message: "Message content exceeds limit" }),
  linkedPoId: z.string().optional(),
  linkedRfqId: z.string().optional()
});

module.exports = {
  chatMessageSchema
};
