import { BuildInfo } from '../../components/BuildInfo';
import { AppLoader } from '../../components/AppLoader';
import { useOnboardingQuery } from '../../hooks/useOnboardingQuery';
import { getPendingSection } from '../../utils/getPendingSection';
import { ONBOARDING_COPY } from './constants';
import { SECTION_VIEWS } from './sectionViews';
import { getProgress } from './utils/getProgress';

export const Onboarding = () => {
  const { data } = useOnboardingQuery();
  const pending = data === undefined ? undefined : getPendingSection(data);
  if (data === undefined || pending === undefined) {
    return <AppLoader />;
  }

  const View = SECTION_VIEWS[pending];
  const progress = getProgress(data.sections, pending);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="font-hand px-3 text-center text-6xl text-accent">{ONBOARDING_COPY.logo}</h1>
      {progress && <p className="text-center text-sm">{progress}</p>}
      <View />
      <BuildInfo />
    </main>
  );
};
