import { useState } from 'react';
import type { FormEvent } from 'react';
import type { RecipeIdea } from '../../../../../../services/recipes/types';
import { buildMockIdeas } from '../../../../utils/buildMockIdeas';
import type { UseIdeasOptions } from './types';

export const useIdeas = ({ onImport, onDone }: UseIdeasOptions) => {
  const [prompt, setPrompt] = useState('');
  const [ideas, setIdeas] = useState<RecipeIdea[]>([]);
  const [ticked, setTicked] = useState<readonly string[]>([]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setIdeas(buildMockIdeas({ prompt }));
    setTicked([]);
  };

  const toggle = ({ id }: { id: string }) =>
    setTicked((current) =>
      current.includes(id) ? current.filter((existing) => existing !== id) : [...current, id],
    );

  const importSelected = () => {
    ideas
      .filter((idea) => ticked.includes(idea.id))
      .forEach((idea) => onImport({ source: idea.url }));
    onDone();
  };

  return { prompt, setPrompt, ideas, ticked, handleSearch, toggle, importSelected };
};
