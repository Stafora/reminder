import { z } from 'zod'

export const reminderCreateSchema = z.object({
    email: z.string().email(),
    message: z.string().min(1),
    sendAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    })
});