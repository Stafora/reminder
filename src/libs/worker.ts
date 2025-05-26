import { Worker, Job } from 'bullmq';
import { redisConnection } from '@/config/redis';
import { prisma } from '@/prisma';
import { sendMesageOnEmail } from '@/senders/email';
import { Status } from '@prisma/client';
import { SendReminderJobData } from '@/types/reminder';
import { REMINDER_QUEUE_NAME } from '@/constants/reminder';

const updateStatus = async (reminderId: string, status: Status): Promise<void> => {
    try {
        await prisma.reminder.update({
            where: { id: reminderId },
            data: { status },
        });
    } catch (err) {
        console.error(`[ReminderWorker] Failed to update status for ${reminderId}`, err)
    }
};

const worker = new Worker<SendReminderJobData>(
    REMINDER_QUEUE_NAME,
    async (job: Job<SendReminderJobData>) => {
        const { reminderId } = job.data;

        const reminder = await prisma.reminder.findUnique({
            where: { id: reminderId },
        });

        if (!reminder) {
            console.warn(`[ReminderWorker] Reminder ${reminderId} not found`)
            return;
        }

        try {
            await sendMesageOnEmail(reminder.email, reminder.message)
            await updateStatus(reminderId, Status.Sended)
        } catch (e) {
            console.error(`[ReminderWorker] Failed to send email to ${reminder.email}`, e)
            await updateStatus(reminderId, Status.Failed)
        }
    },
    { connection: redisConnection }
)

worker.on('failed', async (job, err) => {
    console.error(`[ReminderWorker] ❌ Job failed`, err)

    const reminderId = job?.data?.reminderId

    if (reminderId) {
        await updateStatus(reminderId, Status.Failed)
    }
})