import nodemailer from 'nodemailer'
import { sendMesageOnEmail } from '@/senders/email' // путь адаптируй
import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('nodemailer')

describe('sendMesageOnEmail', () => {
    const mockSendMail = vi.fn()

    beforeEach(() => {
        mockSendMail.mockReset()

        vi.mocked(nodemailer.createTransport).mockReturnValue({
            sendMail: mockSendMail,
        } as any)
    })

    it('should send email and return messageId', async () => {
        mockSendMail.mockResolvedValueOnce({ messageId: '12345' })

        const result = await sendMesageOnEmail('test@example.com', '<b>Test</b>')
        expect(result).toBe('12345')

        expect(nodemailer.createTransport).toHaveBeenCalled()
        expect(mockSendMail).toHaveBeenCalledWith({
            from: `"Reminder" <${process.env.SENDER_EMAIL_MAIL_FROM}>`,
            to: 'test@example.com',
            subject: 'Reminder',
            html: '<b>Test</b>',
        })
    })

    it('should throw on error', async () => {
        mockSendMail.mockRejectedValueOnce(new Error('SMTP error'))

        await expect(sendMesageOnEmail('fail@example.com', 'Oops')).rejects.toThrow('SMTP error')
    })
})
