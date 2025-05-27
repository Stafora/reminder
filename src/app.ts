import express from 'express'
import reminderRoutes from '@/routes/reminder-routes'
import * as dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import { openApiDocument } from '@/swagger/doc'

dotenv.config()

const app = express()
app.use(express.json())

app.use('/reminders', reminderRoutes)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiDocument))

export default app
