export class SendEmailDto {
  to: string
  subject: string
  text?: string
  replacements: { [key: string]: string }
}