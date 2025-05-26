import { Router } from 'express'
import { createReminder, getReminderList } from '@/controllers/reminder-controller'

const router = Router()

router.post('/create', createReminder)
router.get('/all', getReminderList)

export default router;