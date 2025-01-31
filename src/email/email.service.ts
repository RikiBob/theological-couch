import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { SendEmailDto } from './dtoes/send-email.dto';
import { EmailResponseDto } from './dtoes/email-response.dto';
import { Transporter } from 'nodemailer';
import { IEmailService } from './email.interface';
import { promises as fs } from 'fs';
import * as path from 'path';

dotenv.config();

@Injectable()
export class EmailService implements IEmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_SMTP_PASSWORD,
      },
    });
  }

  private async loadTemplate(
    filePath: string,
    replacements: { [key: string]: string },
  ): Promise<string> {
    try {
      const fullPath = path.join(
        process.cwd(),
        'src',
        'email',
        'templates',
        filePath,
      );
      let template = await fs.readFile(fullPath, 'utf8');

      for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, replacements[key]);
      }
      return template;
    } catch (error) {
      throw new InternalServerErrorException('Failed to load email template.');
    }
  }

  async sendEmail({
    to,
    subject,
    text,
    replacements,
  }: SendEmailDto): Promise<EmailResponseDto> {
    try {
      const html = await this.loadTemplate('email-template.html', replacements);
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      return {
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send email. Please try again later.',
      );
    }
  }
}
