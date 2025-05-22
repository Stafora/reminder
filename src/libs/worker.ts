import { Worker } from 'bullmq';
import * as dotenv from 'dotenv';
import { redisConnection } from '@/config/redis'
import { prisma } from '@/prisma'

dotenv.config()

const worker = new Worker('reminderQueue', async (job) => {
    const { reminderId } = job.data

    const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId }
    });

    if (!reminder) {
        console.warn(`Reminder ${reminderId} not found`)
        return;
    }

    console.log(`📧 Sending email to ${reminder.email}: "${reminder.message}"`)

    await prisma.reminder.update({
        where: { id: reminderId },
        data: { status: 'Sended' }
    });

}, { connection: redisConnection })

worker.on('failed', async (job, err) => {
    console.error(`❌ Job failed`, err);

    const reminderId = job?.data.reminderId

    if (reminderId) {
        await prisma.reminder.update({
            where: { 
                id: reminderId
            },
            data: { 
                status: 'Failed'
            }
        });
    }
});