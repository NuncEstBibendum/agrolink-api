export interface MailTemplate {
  templateID: number;
  vars: readonly string[];
}

type ObjectFromList<T extends ReadonlyArray<string>, V = string> = {
  [K in T extends ReadonlyArray<infer U> ? U : never]: V;
};

export type MailTemplateVars<T extends keyof typeof MailTemplates> =
  ObjectFromList<(typeof MailTemplates)[T]['vars']>;

export const MailTemplates = {
  'Send temporary password': {
    templateID: 1,
    vars: ['temporaryPassword'] as const,
  },
};
