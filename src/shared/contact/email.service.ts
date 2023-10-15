import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import { MailTemplates, MailTemplateVars } from './mailTemplates';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendMail<T extends keyof typeof MailTemplates>(
    template: T,
    to: string | string[],
    variables: MailTemplateVars<T>,
  ) {
    const recipients = Array.isArray(to) ? to : [to];

    const api = new SibApiV3Sdk.TransactionalEmailsApi();
    api.setApiKey(
      SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
      this.configService.get('SENDINBLUE_API_KEY'),
    );

    return api.sendTransacEmail({
      templateId: MailTemplates[template].templateID,
      to: recipients.map((email) => ({ email })),
      params: variables,
    });
  }
}
