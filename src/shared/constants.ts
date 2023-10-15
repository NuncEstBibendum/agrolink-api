export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\d\\s]).{${MIN_PASSWORD_LENGTH},}`,
);
export const MAX_OTP_LENGTH = 5;
export const OTP_VALIDITY_MINUTES = 120;

export const SIGNED_URL_EXPIRATION_SECONDS = 60 * 60 * 1; // 1 hour

export const DAYS_BEFORE_ACCOUNT_DELETION = 1;
