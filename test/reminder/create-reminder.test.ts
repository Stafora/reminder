import request from 'supertest'
import { describe, it, expect, vi, beforeEach, afterAll, Mock } from 'vitest'
import app from '@/app'
import { prisma } from '@/prisma'
import { reminderQueue } from '@/libs/queue'
import { JOB_NAME, MIN_DELAY_MS } from '@/constants/reminder'
import { Status } from '@prisma/client'

vi.mock('@/prisma', () => ({
    prisma: {
        reminder: {
            create: vi.fn()
        },
    },
}))

vi.mock('@/libs/queue', () => ({
    reminderQueue: {
        add: vi.fn()
    },
}))

describe('Дополнительные тесты для POST /reminders/create', () => {
    const NOW = new Date('2025-01-01T00:00:00Z')

    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(NOW)
        vi.clearAllMocks()
    })

    afterAll(() => {
        vi.useRealTimers()
    })

    it('возвращает 400 при некорректном формате email', async () => {
        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: 'not-an-email',
                message: 'Hello',
                sendAt: new Date(NOW.getTime() + 60000).toISOString(),
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
        expect(response.body.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['email'],
                    message: expect.any(String),
                }),
            ])
        )
    })

    it('возвращает 400 если отсутствует обязательное поле message', async () => {
        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: 'test@example.com',
                sendAt: new Date(NOW.getTime() + 60000).toISOString(),
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
        expect(response.body.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['message'],
                    message: expect.any(String),
                }),
            ])
        )
    })

    it('возвращает 400 если sendAt имеет неверный формат', async () => {
        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: 'test@example.com',
                message: 'Hello',
                sendAt: 'invalid-date',
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toBe('Validation error')
        expect(response.body.issues).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    path: ['sendAt'],
                    message: expect.any(String),
                }),
            ])
        )
    })

    it(`возвращает 400 если sendAt меньше ${MIN_DELAY_MS}ms`, async () => {
        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: 'test@example.com',
                message: 'Hello',
                sendAt: new Date(NOW.getTime() + MIN_DELAY_MS - 1).toISOString(),
            })

        expect(response.status).toBe(400)
        expect(response.body.message).toMatch(/sendAt must be at least/)
    })

    it('успешно создает напоминание если sendAt ровно MIN_DELAY_MS в будущем', async () => {
        const sendAt = new Date(NOW.getTime() + MIN_DELAY_MS)

        const mockReminder = {
            id: '2',
            email: 'example@example.com',
            message: 'Exact delay',
            sendAt,
            status: 'Pending' as Status,
            createdAt: NOW,
            updatedAt: NOW,
        }

        vi.mocked(prisma.reminder.create).mockResolvedValue(mockReminder)

        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: mockReminder.email,
                message: mockReminder.message,
                sendAt: mockReminder.sendAt.toISOString(),
            })

        expect(response.status).toBe(201)
        expect(response.body).toEqual({ id: '2' })
        expect(reminderQueue.add).toHaveBeenCalledWith(
            JOB_NAME,
            { reminderId: '2' },
            expect.objectContaining({
                delay: MIN_DELAY_MS,
                attempts: 3,
            })
        )
    })

    it('возвращает 500 при ошибке базы данных', async () => {
        const mockedCreate = prisma.reminder.create as Mock
        mockedCreate.mockRejectedValue(new Error('DB failure'))

        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: 'test@example.com',
                message: 'Hello',
                sendAt: new Date(NOW.getTime() + 60000).toISOString(),
            })

        expect(response.status).toBe(500)
        expect(response.body.message).toBe('Internal server error')
    })

    it('возвращает 500 при ошибке добавления в очередь', async () => {
        const mockReminder = {
            id: '1',
            email: 'example@example.com',
            message: 'Queue failure test',
            sendAt: new Date(NOW.getTime() + 60000),
            status: 'Pending' as Status,
            createdAt: NOW,
            updatedAt: NOW,
        }

        vi.mocked(prisma.reminder.create).mockResolvedValue(mockReminder)

        vi.mocked(reminderQueue.add).mockRejectedValue(new Error('Queue failure'))

        const response = await request(app)
            .post('/reminders/create')
            .send({
                email: mockReminder.email,
                message: mockReminder.message,
                sendAt: mockReminder.sendAt.toISOString(),
            })

        expect(response.status).toBe(500)
        expect(response.body.message).toBe('Internal server error')
    })
})
