import { Request, Response } from 'express';
import { myQueue } from '@/jobs/queue';

export const createJob = async (req: Request, res: Response) => {
    const { name } = req.body;

    await myQueue.add('log-job', { name }, {
        delay: 5000,
    });

    res.json({ status: 'Job scheduled' });
};
