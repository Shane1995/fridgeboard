const EMAIL_KEY = 'email';

const decode = (value: string): string | undefined => {
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
};

export const readEmailFragment = (hash: string): string | undefined => {
  const pair = hash
    .replace(/^#/, '')
    .split('&')
    .map((part) => part.split('='))
    .find(([key]) => key === EMAIL_KEY);
  const email = pair?.[1] === undefined ? undefined : decode(pair[1])?.trim();
  return email || undefined;
};
