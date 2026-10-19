import { createFileRoute } from '@tanstack/react-router';
import { Username } from '../../pages/Username';

export const Route = createFileRoute('/_authenticated/username')({ component: Username });
