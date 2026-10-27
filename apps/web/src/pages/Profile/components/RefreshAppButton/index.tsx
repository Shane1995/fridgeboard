import { Button } from '@heroui/react';
import { useState } from 'react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { forceAppRefresh } from '../../../../services/appUpdates/forceAppRefresh';
import { REFRESH_APP_COPY } from './constants';

export const RefreshAppButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handlePress = () => {
    setIsRefreshing(true);
    void forceAppRefresh().catch(() => setIsRefreshing(false));
  };

  return (
    <section className="flex flex-col gap-2">
      <Button variant="secondary" isPending={isRefreshing} onPress={handlePress}>
        {REFRESH_APP_COPY.button}
      </Button>
      <Typography variant={TypographyVariant.Caption}>{REFRESH_APP_COPY.hint}</Typography>
    </section>
  );
};
