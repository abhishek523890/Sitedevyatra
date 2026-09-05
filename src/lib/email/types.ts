/** Email provider contract. Swap providers without touching call sites. */
export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  ok: boolean;
  providerId?: string;
  error?: string;
}

export interface EmailProvider {
  name: string;
  send(params: SendEmailParams): Promise<SendEmailResult>;
}
