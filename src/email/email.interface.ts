import { SendEmailDto } from './dtoes/send-email.dto';
import { EmailResponseDto } from './dtoes/email-response.dto';

export interface IEmailService {
  sendEmail(emailOptions: SendEmailDto): Promise<EmailResponseDto>;
}
