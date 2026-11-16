import { Chip } from '@heroui/react';
import { BuildInfo } from '../../components/BuildInfo';
import { PageShell } from '../../components/PageShell';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';
import { FeatureFlagsSection } from './components/FeatureFlagsSection';
import { InviteForm } from './components/InviteForm';
import { RefreshAppButton } from './components/RefreshAppButton';
import { SignOutButton } from './components/SignOutButton';
import { SETTINGS_COPY } from './constants';
import { useSettings } from './hooks/useSettings';

export const Settings = () => {
  const {
    me,
    households,
    isLoadingHouseholds,
    hasHouseholdsError,
    showMembers,
    members,
    hasMembersError,
  } = useSettings();

  return (
    <PageShell title={SETTINGS_COPY.title}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          {me && (
            <>
              <Typography variant={TypographyVariant.Strong} as="p">
                {me.username ?? me.email}
              </Typography>
              {me.username && (
                <Typography variant={TypographyVariant.Caption}>{me.email}</Typography>
              )}
            </>
          )}
        </div>
        <section aria-label={SETTINGS_COPY.households} className="flex flex-col gap-3">
          <Typography variant={TypographyVariant.Heading3} as="h2">
            {SETTINGS_COPY.households}
          </Typography>
          {hasHouseholdsError && <Typography>{SETTINGS_COPY.loadFailed}</Typography>}
          {!isLoadingHouseholds && !hasHouseholdsError && households.length === 0 && (
            <Typography>{SETTINGS_COPY.noHouseholds}</Typography>
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
                <Chip size="sm">{SETTINGS_COPY.roles[role]}</Chip>
              </li>
            ))}
          </ul>
        </section>
        {showMembers && (
          <section aria-label={SETTINGS_COPY.members} className="flex flex-col gap-3">
            <Typography variant={TypographyVariant.Heading3} as="h2">
              {SETTINGS_COPY.members}
            </Typography>
            {hasMembersError && <Typography>{SETTINGS_COPY.membersLoadFailed}</Typography>}
            <ul aria-label={SETTINGS_COPY.members} className="flex flex-col gap-2">
              {members.map(({ id, username, role }) => (
                <li
                  key={id}
                  className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 shadow-sm"
                >
                  <Typography variant={TypographyVariant.Strong} as="span">
                    {username ?? SETTINGS_COPY.unnamedMember}
                    {id === me?.sub && (
                      <Typography variant={TypographyVariant.Caption} as="span">
                        {' '}
                        {SETTINGS_COPY.you}
                      </Typography>
                    )}
                  </Typography>
                  <Chip size="sm">{SETTINGS_COPY.roles[role]}</Chip>
                </li>
              ))}
            </ul>
            <InviteForm />
          </section>
        )}
        <FeatureFlagsSection />
        <RefreshAppButton />
        <SignOutButton />
        <BuildInfo />
      </div>
    </PageShell>
  );
};
