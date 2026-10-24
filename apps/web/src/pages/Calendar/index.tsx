import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { CALENDAR_COPY } from './constants';

export const Calendar = () => {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <PageHeader title={CALENDAR_COPY.title} />
      <Typography>{CALENDAR_COPY.placeholder}</Typography>
    </main>
  );
};
