import express from 'express'
import reminderRoutes from '@/routes/reminder-routes'

const app = express()
app.use(express.json())

app.use('/reminders', reminderRoutes)

export default app
