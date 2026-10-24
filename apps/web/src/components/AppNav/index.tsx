import { Link } from '@tanstack/react-router';
import { SettingsMenu } from '../SettingsMenu';
import { APP_NAME, NAV_ITEMS, NAV_LABEL } from './constants';

export const AppNav = () => {
  return (
    <div className="md:sticky md:top-0 md:z-40 md:flex md:h-14 md:items-center md:border-b md:border-foreground/5 md:bg-white/60 md:px-6 md:backdrop-blur-xl md:backdrop-saturate-150">
      <Link
        to="/"
        className="hidden font-hand text-3xl leading-none text-foreground outline-none md:block md:w-48"
      >
        {APP_NAME}
      </Link>
      <nav
        aria-label={NAV_LABEL}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/40 pb-[env(safe-area-inset-bottom)] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_-8px_32px_rgba(29,43,58,0.12)] backdrop-blur-2xl backdrop-saturate-200 md:static md:inset-x-auto md:bottom-auto md:flex-1 md:border-0 md:bg-transparent md:pb-0 md:shadow-none md:backdrop-filter-none"
      >
        <ul className="mx-auto flex max-w-md items-center justify-around md:max-w-none md:justify-center md:gap-2 md:py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1 md:flex-none">
              <Link
                to={to}
                activeOptions={{ exact: true }}
                className="flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium opacity-60 transition-opacity md:flex-row md:gap-2 md:rounded-full md:px-4 md:text-sm md:hover:bg-black/5"
                activeProps={{ className: 'text-accent opacity-100', 'aria-current': 'page' }}
              >
                <Icon aria-hidden size={22} />
                {label}
              </Link>
            </li>
          ))}
          <li className="flex-1 md:flex-none">
            <SettingsMenu />
          </li>
        </ul>
      </nav>
      <div aria-hidden className="hidden md:block md:w-48" />
    </div>
  );
};
