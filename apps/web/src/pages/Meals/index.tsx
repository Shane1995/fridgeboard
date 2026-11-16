import { PageHeader } from '../../components/PageHeader';
import { Typography } from '../../components/Typography';
import { MEALS_COPY } from './constants';
import { Planner } from './components/Planner';
import { useMeals } from './hooks/useMeals';

export const Meals = () => {
  const meals = useMeals();

  if (!meals.enabled) {
    return (
      <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
        <PageHeader title={MEALS_COPY.title} />
        <Typography>{MEALS_COPY.placeholder}</Typography>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 p-4 md:p-6">
      <PageHeader title={MEALS_COPY.title} />
      <Planner
        days={meals.planner.days}
        focusId={meals.planner.focusId}
        todayWeekday={meals.planner.todayWeekday}
        onAddLine={meals.planner.addLine}
        onUpdateLine={meals.planner.updateLine}
        onRemoveLine={meals.planner.removeLine}
        onAddRecipeLine={meals.planner.addRecipeLine}
        onSetLineRecipe={meals.planner.setLineRecipe}
        onUnlinkRecipe={meals.planner.unlinkRecipe}
      />
    </main>
  );
};
