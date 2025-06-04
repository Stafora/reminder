import { getReminderList } from '@/controllers/reminder-controller'
import { prisma } from '@/prisma'
import { Request, Response } from 'express'
import { vi } from 'vitest'
import { Status } from '@prisma/client'

vi.mock('@/prisma', () => ({
    prisma: {
        reminder: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
    },
}))

describe('getReminderList', () => {
    const NOW = new Date('2024-01-01T00:00:00Z')

    const mockReminders = [
        {
            id: '1',
            email: 'user1@example.com',
            message: 'Message 1',
            sendAt: new Date(NOW.getTime() + 60000),
            status: 'Pending' as Status,
            createdAt: NOW,
            updatedAt: NOW,
        },
        {
            id: '2',
            email: 'user2@example.com',
            message: 'Message 2',
            sendAt: new Date(NOW.getTime() + 120000),
            status: 'Sent' as Status,
            createdAt: NOW,
            updatedAt: NOW,
        },
    ]

    const req = {
        query: {
            page: '1',
            limit: '10',
        },
    } as unknown as Request

    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const res = { json, status } as unknown as Response

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return paginated list of reminders', async () => {
        vi.mocked(prisma.reminder.count).mockResolvedValue(2)
        vi.mocked(prisma.reminder.findMany).mockResolvedValue(mockReminders)

        await getReminderList(req, res)

        expect(prisma.reminder.count).toHaveBeenCalled()
        expect(prisma.reminder.findMany).toHaveBeenCalledWith({
            orderBy: { sendAt: 'desc' },
            skip: 0,
            take: 10,
        })

        expect(json).toHaveBeenCalledWith({
            reminders: mockReminders.map((r) => ({
                id: r.id,
                email: r.email,
                message: r.message,
                sendAt: r.sendAt.toISOString(),
                status: r.status,
                createdAt: r.createdAt.toISOString(),
                updatedAt: r.updatedAt.toISOString(),
            })),
            total: 2,
            page: 1,
            limit: 10,
        })
    })

    it('should return 500 on error', async () => {
        vi.mocked(prisma.reminder.count).mockRejectedValue(new Error('DB failed'))

        await getReminderList(req, res)

        expect(status).toHaveBeenCalledWith(500)
        expect(json).toHaveBeenCalledWith({ message: 'Internal server error' })
    })
})
