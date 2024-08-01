export interface MailInterface {
  from?: string;

  to: string;

  subject?: string;

  text?: string;

  context?: any;

  [key: string]: any;
}
