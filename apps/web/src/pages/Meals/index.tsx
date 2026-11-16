import { PageShell } from '../../components/PageShell';
import { Typography } from '../../components/Typography';
import { MEALS_COPY } from './constants';
import { Planner } from './components/Planner';
import { useMeals } from './hooks/useMeals';

export const Meals = () => {
  const meals = useMeals();

  if (!meals.enabled) {
    return (
      <PageShell title={MEALS_COPY.title}>
        <Typography>{MEALS_COPY.placeholder}</Typography>
      </PageShell>
    );
  }

  return (
    <PageShell title={MEALS_COPY.title}>
      <Planner
        days={meals.planner.days}
        focusId={meals.planner.focusId}
        todayWeekday={meals.planner.todayWeekday}
        onAddLine={meals.planner.addLine}
        onUpdateLine={meals.planner.updateLine}
        onRemoveLine={meals.planner.removeLine}
        onAddRecipeLine={meals.planner.addRecipeLine}
        onSwapBackup={meals.planner.swapBackup}
        onSetLineRecipe={meals.planner.setLineRecipe}
        onUnlinkRecipe={meals.planner.unlinkRecipe}
      />
    </PageShell>
  );
};
