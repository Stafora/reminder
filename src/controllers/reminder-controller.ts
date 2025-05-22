import { Request, Response } from 'express'
import { reminderQueue } from '@/libs/queue'
import { prisma } from '@/prisma';
import { reminderCreateSchema } from '@/validate-schemes/reminder-scheme'
import { z, ZodError, ZodIssue } from 'zod'

type CreateReminderResponse = { id: number | string }

export const createReminder = async (
    req: Request,
    res: Response<CreateReminderResponse | { error: string } | { error: ZodIssue[] }>
): Promise<void> => {
    try {
        const { email, message, sendAt } = reminderCreateSchema.parse(req.body)

        const sendAtDate = new Date(sendAt);
        const delay = sendAtDate.getTime() - Date.now()

        if (delay < 0) {
            res.status(400).json({ error: 'sendAt must be in the future' })
            return;
        }

        const reminder = await prisma.reminder.create({
            data: { 
                email, 
                message, 
                sendAt: sendAtDate
            }
        });

        await reminderQueue.add(
            'sendReminder',
            { 
                reminderId: reminder.id
            },
            {
                delay,
                attempts: 3,
                backoff: { 
                    type: 'exponential', 
                    delay: 1000 
                }
            }
        );

        res.status(201).json({ id: reminder.id })
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({ error: err.errors })
        } else {
            res.status(500).json({ error: 'Internal server error' })
        }
    }
};