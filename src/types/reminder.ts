import { reminderCreateSchema } from "@/validate-schemes/reminder-scheme";
import { Reminder } from "@prisma/client";
import z, { ZodError } from "zod";

export interface SendReminderJobData {
    reminderId: string;
}

export interface ReminderDTO {
    id: string;
    email: string;
    message: string;
    sendAt: string;
    status: Reminder['status'];
    createdAt: string;
    updatedAt: string;
}

export interface GetReminderListResponse {
    reminders: ReminderDTO[];
    total: number;
    page: number;
    limit: number;
}

export type CreateReminderInput = z.infer<typeof reminderCreateSchema>

export interface CreateReminderResponse {
    id: number | string;
}

export interface ErrorReminderResponse {
    message: string;
    issues?: ZodError['issues'];
}