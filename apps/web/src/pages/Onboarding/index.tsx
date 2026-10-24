import { BuildInfo } from '../../components/BuildInfo';
import { AppLoader } from '../../components/AppLoader';
import { useOnboardingQuery } from '../../hooks/useOnboardingQuery';
import { getPendingSection } from '../../utils/getPendingSection';
import { ONBOARDING_COPY } from './constants';
import { SECTION_VIEWS } from './sectionViews';
import { Typography } from '../../components/Typography';
import { TypographyVariant } from '../../components/Typography/constants';

export const Onboarding = () => {
  const { data } = useOnboardingQuery(true);
  const pending = data === undefined ? undefined : getPendingSection(data);
  if (pending === undefined) {
    return <AppLoader />;
  }

  const View = SECTION_VIEWS[pending];

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <Typography variant={TypographyVariant.Logo} className="text-center">
        {ONBOARDING_COPY.logo}
      </Typography>
      <View />
      <BuildInfo />
    </main>
  );
};
