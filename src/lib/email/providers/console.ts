import type { EmailProvider, SendEmailParams, SendEmailResult } from '../types';

/** Dev fallback: logs the email instead of sending. Used when no API key is set. */
export const consoleProvider: EmailProvider = {
  name: 'console',
  async send(params: SendEmailParams): Promise<SendEmailResult> {
    // eslint-disable-next-line no-console
    console.log('[email:console]', params.to, '::', params.subject);
    return { ok: true, providerId: `console-${Date.now()}` };
  },
};
