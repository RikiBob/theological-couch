import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { SendEmailDto } from "./dtoes/send-email.dto";
import { EmailResponseDto } from "./dtoes/email-response.dto";
import { Transporter } from 'nodemailer';

dotenv.config();

@Injectable()
export class EmailService {
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

  async sendEmail({ to, subject, text, html }: SendEmailDto): Promise<EmailResponseDto> {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
      return {
        messageId: info.messageId,
        response: info.response,
      };
    } catch (error) {
      console.error('Error sending email: ', error);
      throw new InternalServerErrorException('Failed to send email. Please try again later.');
    }
  }
}
