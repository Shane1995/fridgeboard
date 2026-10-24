import { Chip } from '@heroui/react';
import { BuildInfo } from '../../components/BuildInfo';
import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';
import { PROFILE_COPY } from './constants';
import { useProfile } from './hooks/useProfile';

export const Profile = () => {
  const { me, households, isLoadingHouseholds, hasHouseholdsError } = useProfile();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <PageHeader title={PROFILE_COPY.title} />
        {me && (
          <>
            <Typography variant={TypographyVariant.Strong} as="p">
              {me.username ?? me.email}
            </Typography>
            {me.username && <Typography variant={TypographyVariant.Caption}>{me.email}</Typography>}
          </>
        )}
      </header>
      <section aria-label={PROFILE_COPY.households} className="flex flex-col gap-3">
        <Typography variant={TypographyVariant.Heading3} as="h2">
          {PROFILE_COPY.households}
        </Typography>
        {hasHouseholdsError && <Typography>{PROFILE_COPY.loadFailed}</Typography>}
        {!isLoadingHouseholds && !hasHouseholdsError && households.length === 0 && (
          <Typography>{PROFILE_COPY.noHouseholds}</Typography>
        )}
        <ul className="flex flex-col gap-2">
          {households.map(({ id, name, role }) => (
            <li
              key={id}
              className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-sm"
            >
              <Typography variant={TypographyVariant.Strong} as="span">
                {name}
              </Typography>
              <Chip size="sm">{PROFILE_COPY.roles[role]}</Chip>
            </li>
          ))}
        </ul>
      </section>
      <BuildInfo />
    </main>
  );
};
