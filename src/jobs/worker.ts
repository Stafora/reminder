import { Worker } from 'bullmq';
import * as dotenv from 'dotenv';
import { redisConnection } from '@/config/redis'

dotenv.config();

const worker = new Worker(
    'logQueue',
    async (job) => {
        console.log(`⏱️ Job received:`, job.data);
    },
    { 
        connection: redisConnection 
    }
);

worker.on('failed', (job, err) => {
    console.error(`❌ Job failed`, err);
});
