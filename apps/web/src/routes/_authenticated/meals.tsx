import { createFileRoute } from '@tanstack/react-router';
import { Meals } from '../../pages/Meals';

export const Route = createFileRoute('/_authenticated/meals')({ component: Meals });
