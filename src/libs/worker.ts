import { Worker } from 'bullmq'
import { redisConnection } from '@/config/redis'
import { prisma } from '@/prisma'
import { sendMesageOnEmail } from '@/senders/email'
import { Status } from '@prisma/client'

const worker = new Worker('reminderQueue', async (job) => {
    const { reminderId } = job.data

    const reminder = await prisma.reminder.findUnique({
        where: { id: reminderId }
    });

    if (!reminder) {
        console.warn(`Reminder ${reminderId} not found`)
        return
    }

    try {
        await sendMesageOnEmail(reminder.message)

        updateStatus(reminderId, Status.Sended)
    } catch(e){
        updateStatus(reminderId, Status.Failed)
    }
}, { connection: redisConnection })

worker.on('failed', async (job, err) => {
    console.error(`❌ Job failed`, err);

    const reminderId = job?.data.reminderId

    if (reminderId) {
        updateStatus(reminderId, Status.Failed)
    }
})

const updateStatus = async (reminderId: any, status: any) => {
    await prisma.reminder.update({
        where: { 
            id: reminderId
        },
        data: { 
            status
        }
    })
} 