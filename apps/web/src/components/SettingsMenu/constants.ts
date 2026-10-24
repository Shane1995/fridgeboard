export enum SettingsMenuAction {
  Profile = 'profile',
  SignOut = 'signOut',
}

export const SETTINGS_MENU_COPY = {
  trigger: 'Settings',
  menuLabel: 'Settings menu',
  profile: 'Profile',
  signOut: 'Sign out',
} as const;
