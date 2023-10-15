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
  'Send email validation code on register': {
    templateID: 1,
    vars: ['url'] as const,
  },
  'Send password recovery link': {
    templateID: 2,
    vars: ['url'] as const,
  },
  'Send deletion confirmation': {
    templateID: 3,
    vars: ['daysBeforeDeletion'] as const,
  },
  'Send deletion cancellation': {
    templateID: 4,
    vars: [] as const,
  },
  'Send account deleted notification': {
    templateID: 5,
    vars: ['daysBeforeDeletion'] as const,
  },
};
