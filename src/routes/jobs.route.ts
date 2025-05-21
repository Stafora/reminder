import { Router } from 'express';
import { createJob } from '@/controllers/jobs.controller';

const router = Router();

router.post('/jobs', createJob);

export default router;