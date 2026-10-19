export type IUsernameRequest = { username: string };

export type IUsernameResponse = { username: string };

export type IUsernameErrorResponse = {
  reason: 'invalid-username' | 'username-taken' | 'username-set';
};
