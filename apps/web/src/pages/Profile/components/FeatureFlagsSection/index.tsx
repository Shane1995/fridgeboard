import { Button, Chip, Switch } from '@heroui/react';
import { useState } from 'react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { useRemoteConfigContext } from '../../../../hooks/useRemoteConfigContext';
import { WebFeatureFlag } from '../../../../services/configuration/schema/constants';
import { readFlagOverrides } from '../../../../services/featureFlagOverrides/readFlagOverrides';
import { writeFlagOverrides } from '../../../../services/featureFlagOverrides/writeFlagOverrides';
import type { FlagOverrides } from '../../../../services/featureFlagOverrides/types';
import { FEATURE_FLAGS_COPY, FEATURE_FLAG_LABELS } from './constants';

const FLAGS = Object.values(WebFeatureFlag);

// Switches only stage a change, so flipping several is instant; Apply stores them and reloads once.
export const FeatureFlagsSection = () => {
  const { featureFlags } = useRemoteConfigContext();
  const [stored, setStored] = useState<FlagOverrides>(readFlagOverrides);
  const [values, setValues] = useState(featureFlags);
  const [isApplying, setIsApplying] = useState(false);

  const changed = FLAGS.filter((flag) => values[flag] !== featureFlags[flag]);

  const store = (next: FlagOverrides) => {
    setIsApplying(true);
    writeFlagOverrides({ overrides: next });
    setStored(next);
    window.location.reload();
  };

  const apply = () =>
    store({ ...stored, ...Object.fromEntries(changed.map((flag) => [flag, values[flag]])) });

  return (
    <section aria-label={FEATURE_FLAGS_COPY.title} className="flex flex-col gap-3">
      <Typography variant={TypographyVariant.Heading3} as="h2">
        {FEATURE_FLAGS_COPY.title}
      </Typography>
      <ul className="flex flex-col gap-2">
        {FLAGS.map((flag) => (
          <li key={flag} className="rounded-2xl bg-white/70 shadow-sm">
            <Switch
              isSelected={values[flag]}
              onChange={(isOn) => setValues((current) => ({ ...current, [flag]: isOn }))}
              className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-3 px-4 py-3"
            >
              <Switch.Content className="flex flex-1 items-center gap-2">
                {FEATURE_FLAG_LABELS[flag]}
                {flag in stored && <Chip size="sm">{FEATURE_FLAGS_COPY.changed}</Chip>}
              </Switch.Content>
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
            </Switch>
          </li>
        ))}
      </ul>
      <Button
        variant="primary"
        isDisabled={changed.length === 0}
        isPending={isApplying}
        onPress={apply}
      >
        {FEATURE_FLAGS_COPY.apply}
      </Button>
      {Object.keys(stored).length > 0 && (
        <Button variant="secondary" isDisabled={isApplying} onPress={() => store({})}>
          {FEATURE_FLAGS_COPY.reset}
        </Button>
      )}
      <Typography variant={TypographyVariant.Caption}>{FEATURE_FLAGS_COPY.hint}</Typography>
    </section>
  );
};
