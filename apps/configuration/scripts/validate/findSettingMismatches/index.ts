import { SHARED_SETTINGS } from './constants.ts';

const settingOf = (file: unknown, key: string): unknown => {
  if (typeof file !== 'object' || file === null || !('settings' in file)) {
    return undefined;
  }
  const { settings } = file;
  return typeof settings === 'object' && settings !== null ? Reflect.get(settings, key) : undefined;
};

export const findSettingMismatches = (web: unknown, lambda: unknown): string[] =>
  SHARED_SETTINGS.flatMap((key) =>
    settingOf(web, key) === settingOf(lambda, key)
      ? []
      : [
          `settings.${key} differs: web=${String(settingOf(web, key))} lambda=${String(settingOf(lambda, key))}`,
        ],
  );
