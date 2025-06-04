import { Request, Response } from 'express'
import { reminderQueue } from '@/libs/queue'
import { prisma } from '@/prisma';
import { reminderCreateSchema } from '@/validate-schemes/reminder-scheme'
import { z, ZodError } from 'zod'
import { MIN_DELAY_MS, JOB_NAME } from '@/constants/reminder'
import { CreateReminderInput, CreateReminderResponse, ErrorReminderResponse, GetReminderListResponse } from '@/types/reminder';

export const createReminder = async (
    req: Request<unknown, unknown, CreateReminderInput>,
    res: Response<CreateReminderResponse | ErrorReminderResponse>
): Promise<void> => {
    try {
        const { email, message, sendAt } = reminderCreateSchema.parse(req.body);

        const sendAtDate = new Date(sendAt);
        const delay = sendAtDate.getTime() - Date.now();

        if (delay < MIN_DELAY_MS) {
            res.status(400).json({
                message: `sendAt must be at least ${MIN_DELAY_MS / 1000} seconds in the future`,
            });
            return;
        }

        const reminder = await prisma.reminder.create({
            data: {
                email,
                message,
                sendAt: sendAtDate,
            },
        });

        try {
            await reminderQueue.add(
                JOB_NAME,
                { reminderId: reminder.id },
                {
                    delay,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 1000,
                    },
                    removeOnComplete: true,
                    removeOnFail: false,
                }
            );
        } catch (queueErr) {
            console.error('Failed to enqueue reminder job', queueErr);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }

        res.status(201).json({ id: reminder.id });
    } catch (err) {
        if (err instanceof ZodError) {
            res.status(400).json({
                message: 'Validation error',
                issues: err.issues,
            });
        } else {
            console.error('Unexpected error in createReminder:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
}

export const getReminderList = async (
    req: Request<{}, {}, {}, { page?: string; limit?: string }>,
    res: Response<GetReminderListResponse | ErrorReminderResponse>
): Promise<void> => {
    try {
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '10', 10);

        const skip = (page - 1) * limit;

        const [total, reminders] = await Promise.all([
            prisma.reminder.count(),
            prisma.reminder.findMany({
                orderBy: { sendAt: 'desc' },
                skip,
                take: limit,
            }),
        ]);

        res.json({
            reminders: reminders.map((reminder) => ({
                id: reminder.id,
                email: reminder.email,
                message: reminder.message,
                sendAt: reminder.sendAt.toISOString(),
                status: reminder.status,
                createdAt: reminder.createdAt.toISOString(),
                updatedAt: reminder.updatedAt.toISOString(),
            })),
            total,
            page,
            limit,
        });
    } catch (err) {
        console.error('[getReminderList] Failed to fetch reminders', err);
        res.status(500).json({ message: 'Internal server error' });
    }
}