import { Queue } from 'bullmq';
import { redisConnection } from '@/config/redis'
import * as dotenv from 'dotenv'

dotenv.config()

export const reminderQueue = new Queue('reminderQueue', {
    connection: redisConnection
});