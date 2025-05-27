import { reminderCreateSchema } from '@/validate-schemes/reminder-scheme'
import { z } from 'zod'

import { registry } from '@/swagger/registry'

registry.registerPath({
    method: 'post',
    path: '/reminder/create',
    tags: ['Reminders'],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: reminderCreateSchema,
                },
            },
        },
    },
    responses: {
        201: {
            description: 'Reminder successfully created',
            content: {
                'application/json': {
                    schema: z.object({ id: z.string() }),
                },
            },
        },
        400: {
            description: 'Validation error',
            content: {
                'application/json': {
                    schema: z.object({
                        message: z.string(),
                        issues: z.array(z.any()).optional(),
                    }),
                },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string() }),
                },
            },
        },
    },
});

registry.registerPath({
    method: 'get',
    path: '/reminder/all',
    tags: ['Reminders'],
    request: {
        query: z.object({
            page: z.string().optional().openapi({ example: '1' }),
            limit: z.string().optional().openapi({ example: '10' }),
        }),
    },
    responses: {
        200: {
            description: 'List of reminders',
            content: {
                'application/json': {
                    schema: z.object({
                        reminders: z.array(
                            z.object({
                                id: z.string(),
                                email: z.string(),
                                message: z.string(),
                                sendAt: z.string(),
                                status: z.string(),
                                createdAt: z.string(),
                                updatedAt: z.string(),
                            })
                        ),
                        total: z.number(),
                        page: z.number(),
                        limit: z.number(),
                    }),
                },
            },
        },
        500: {
            description: 'Server error',
            content: {
                'application/json': {
                    schema: z.object({ message: z.string() }),
                },
            },
        },
    },
});