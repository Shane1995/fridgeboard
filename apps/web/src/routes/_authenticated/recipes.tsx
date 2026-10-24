import { createFileRoute } from '@tanstack/react-router';
import { Recipes } from '../../pages/Recipes';

export const Route = createFileRoute('/_authenticated/recipes')({ component: Recipes });
