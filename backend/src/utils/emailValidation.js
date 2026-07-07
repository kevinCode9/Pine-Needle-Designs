const GMAIL_ADDRESS_PATTERN = /^[a-z0-9](?:[a-z0-9.+_-]*[a-z0-9])?@(?:gmail|googlemail)\.com$/;

export const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const isGmailAddress = (email) => {
  const normalized = normalizeEmail(email);
  return Boolean(normalized) && GMAIL_ADDRESS_PATTERN.test(normalized);
};
