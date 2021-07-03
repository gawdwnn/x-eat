import { Inject, Injectable } from '@nestjs/common';
import * as FormData from 'form-data';
import got from 'got';
import { CONFIG_OPTIONS } from '../common/common.constants';
import { EmailVar, MailModuleOptions } from './mai.interfaces';

@Injectable()
export class MailService {
  constructor(@Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions) {}

  async sendEmail(subject: string, template: string, to: string, emailVars: EmailVar[]): Promise<boolean> {
    const form = new FormData();
    form.append('from', `Smartt from Eats <mailgun@${this.options.domain}>`);
    form.append('to', `${to}`);
    form.append('subject', `${subject}`);
    form.append('template', template);
    emailVars.forEach((e) => form.append(`v:${e.key}`, e.value));
    try {
      await got.post(`https://api.mailgun.net/v3/${this.options.domain}/messages`, {
        headers: { Authorization: `Basic ${Buffer.from(`api:${this.options.apiKey}`).toString('base64')}` },
        body: form,
      });
      return true;
    } catch (error) {
      // console.log(error.response.body);
      return false;
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'email', email, [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
