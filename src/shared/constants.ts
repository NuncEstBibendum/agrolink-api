export const MIN_PASSWORD_LENGTH = 8;
export const PASSWORD_REGEX = new RegExp(
  `^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\d\\s]).{${MIN_PASSWORD_LENGTH},}`,
);
