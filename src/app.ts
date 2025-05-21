import express from 'express';
import jobsRoute from '@/routes/jobs.route';

const app = express();
app.use(express.json());

app.use(jobsRoute); // подключаем маршруты

export default app;
