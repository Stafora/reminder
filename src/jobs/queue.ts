import { Queue } from 'bullmq';
import { redisConnection } from '@/config/redis'
import * as dotenv from 'dotenv';

dotenv.config();

export const myQueue = new Queue('logQueue', {
  connection: redisConnection
});