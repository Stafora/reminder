import { Queue } from 'bullmq';
import { redisConnection } from '@/config/redis'
import { SendReminderJobData } from '@/types/reminder';

export const reminderQueue = new Queue<SendReminderJobData>('reminderQueue', {
    connection: redisConnection
});