import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { RECIPES_COPY } from './constants';

export const Recipes = () => {
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      <PageHeader title={RECIPES_COPY.title} />
      <Typography>{RECIPES_COPY.placeholder}</Typography>
    </main>
  );
};
