import { fireEvent, render, screen } from '@testing-library/react';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { FLAG_OVERRIDES_STORAGE_KEY } from '../../../../services/featureFlagOverrides/constants';
import { TestProviders } from '../../../../testUtils/TestProviders';
import { createSession } from '../../../../testUtils/createSession';
import { SessionStatus } from '../../../../services/session/constants';
import { TEST_WEB_CONFIGURATION } from '../../../../testUtils/webConfiguration';
import { FEATURE_FLAGS_COPY, FEATURE_FLAG_LABELS } from './constants';
import { FeatureFlagsSection } from '.';

const { session } = createSession(SessionStatus.SignedIn);
const reload = vi.fn();

const config = {
  ...TEST_WEB_CONFIGURATION,
  featureFlags: {
    ...TEST_WEB_CONFIGURATION.featureFlags,
    [WebFeatureFlag.ENABLE_RECIPES]: true,
  },
};

const renderSection = () =>
  render(
    <TestProviders session={session} config={config}>
      <FeatureFlagsSection />
    </TestProviders>,
  );

const flagSwitch = (flag: WebFeatureFlag) =>
  screen.getByRole('switch', { name: FEATURE_FLAG_LABELS[flag] });

describe('FeatureFlagsSection', () => {
  beforeEach(() => {
    reload.mockReset();
    vi.stubGlobal('location', { reload });
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it('shows one switch per feature flag in its current state', () => {
    renderSection();

    expect(screen.getAllByRole('switch')).toHaveLength(Object.values(WebFeatureFlag).length);
    expect(flagSwitch(WebFeatureFlag.ENABLE_RECIPES)).toBeChecked();
    expect(flagSwitch(WebFeatureFlag.ENABLE_CALENDAR_API)).not.toBeChecked();
  });

  it('stores the override and reloads the app when a flag is switched on', () => {
    renderSection();

    fireEvent.click(flagSwitch(WebFeatureFlag.ENABLE_CALENDAR_API));

    expect(window.localStorage.getItem(FLAG_OVERRIDES_STORAGE_KEY)).toBe(
      JSON.stringify({ [WebFeatureFlag.ENABLE_CALENDAR_API]: true }),
    );
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('stores an override that switches a served flag off', () => {
    renderSection();

    fireEvent.click(flagSwitch(WebFeatureFlag.ENABLE_RECIPES));

    expect(window.localStorage.getItem(FLAG_OVERRIDES_STORAGE_KEY)).toBe(
      JSON.stringify({ [WebFeatureFlag.ENABLE_RECIPES]: false }),
    );
  });

  it('keeps earlier overrides when another flag is switched', () => {
    window.localStorage.setItem(
      FLAG_OVERRIDES_STORAGE_KEY,
      JSON.stringify({ [WebFeatureFlag.ENABLE_CALENDAR_API]: true }),
    );
    renderSection();

    fireEvent.click(flagSwitch(WebFeatureFlag.ENABLE_RECIPES));

    expect(JSON.parse(window.localStorage.getItem(FLAG_OVERRIDES_STORAGE_KEY) ?? '{}')).toEqual({
      [WebFeatureFlag.ENABLE_CALENDAR_API]: true,
      [WebFeatureFlag.ENABLE_RECIPES]: false,
    });
  });

  it('offers a reset only while an override is stored', () => {
    renderSection();

    expect(
      screen.queryByRole('button', { name: FEATURE_FLAGS_COPY.reset }),
    ).not.toBeInTheDocument();
  });

  it('clears every override and reloads when reset is pressed', () => {
    window.localStorage.setItem(
      FLAG_OVERRIDES_STORAGE_KEY,
      JSON.stringify({ [WebFeatureFlag.ENABLE_CALENDAR_API]: true }),
    );
    renderSection();

    fireEvent.click(screen.getByRole('button', { name: FEATURE_FLAGS_COPY.reset }));

    expect(window.localStorage.getItem(FLAG_OVERRIDES_STORAGE_KEY)).toBeNull();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
