import { createContext } from 'react';
import type { RecipeBookApi } from './types';

export const RecipeBookContext = createContext<RecipeBookApi | undefined>(undefined);
