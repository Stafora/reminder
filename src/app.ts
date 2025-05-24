import express from 'express'
import reminderRoutes from '@/routes/reminder-routes'
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(express.json())

app.use('/reminders', reminderRoutes)

export default app
