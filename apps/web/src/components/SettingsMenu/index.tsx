import { Dropdown } from '@heroui/react';
import { LogOut, Settings, UserRound } from 'lucide-react';
import { SETTINGS_MENU_COPY, SettingsMenuAction } from './constants';
import { useSettingsMenu } from './hooks/useSettingsMenu';

export const SettingsMenu = () => {
  const { handleAction } = useSettingsMenu();

  return (
    <Dropdown>
      <Dropdown.Trigger className="flex w-full cursor-pointer flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium opacity-60 outline-none transition-opacity data-[pressed]:text-accent data-[pressed]:opacity-100 md:flex-row md:gap-2 md:rounded-full md:px-4 md:text-sm md:hover:bg-black/5">
        <Settings aria-hidden size={22} />
        {SETTINGS_MENU_COPY.trigger}
      </Dropdown.Trigger>
      <Dropdown.Popover className="min-w-56 rounded-2xl border border-foreground/10 bg-white/90 p-1.5 shadow-xl backdrop-blur-xl">
        <Dropdown.Menu aria-label={SETTINGS_MENU_COPY.menuLabel} onAction={handleAction}>
          <Dropdown.Item
            id={SettingsMenuAction.Profile}
            textValue={SETTINGS_MENU_COPY.profile}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-base"
          >
            <UserRound aria-hidden size={18} className="opacity-70" />
            {SETTINGS_MENU_COPY.profile}
          </Dropdown.Item>
          <Dropdown.Item
            id={SettingsMenuAction.SignOut}
            textValue={SETTINGS_MENU_COPY.signOut}
            variant="danger"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-base"
          >
            <LogOut aria-hidden size={18} />
            {SETTINGS_MENU_COPY.signOut}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
