import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

export const reminderCreateSchema = z.object({
  email: z.string().email().openapi({ example: 'user@example.com' }),
  message: z.string().min(1).openapi({ example: 'Hello world' }),
  sendAt: z.string().datetime().openapi({ example: '2025-06-01T10:00:00.000Z' }),
}).openapi('CreateReminderInput')
