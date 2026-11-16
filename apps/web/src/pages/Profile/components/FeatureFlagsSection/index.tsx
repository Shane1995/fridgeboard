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

export const FeatureFlagsSection = () => {
  const { featureFlags } = useRemoteConfigContext();
  const [overrides, setOverrides] = useState<FlagOverrides>(readFlagOverrides);

  const apply = (next: FlagOverrides) => {
    writeFlagOverrides({ overrides: next });
    setOverrides(next);
    window.location.reload();
  };

  return (
    <section aria-label={FEATURE_FLAGS_COPY.title} className="flex flex-col gap-3">
      <Typography variant={TypographyVariant.Heading3} as="h2">
        {FEATURE_FLAGS_COPY.title}
      </Typography>
      <ul className="flex flex-col gap-2">
        {FLAGS.map((flag) => (
          <li
            key={flag}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-4 py-3 shadow-sm"
          >
            <Switch
              isSelected={featureFlags[flag]}
              onChange={(isOn) => apply({ ...overrides, [flag]: isOn })}
            >
              <Switch.Control>
                <Switch.Thumb />
              </Switch.Control>
              <Switch.Content>{FEATURE_FLAG_LABELS[flag]}</Switch.Content>
            </Switch>
            {flag in overrides && <Chip size="sm">{FEATURE_FLAGS_COPY.changed}</Chip>}
          </li>
        ))}
      </ul>
      {Object.keys(overrides).length > 0 && (
        <Button variant="secondary" onPress={() => apply({})}>
          {FEATURE_FLAGS_COPY.reset}
        </Button>
      )}
      <Typography variant={TypographyVariant.Caption}>{FEATURE_FLAGS_COPY.hint}</Typography>
    </section>
  );
};
