import { Modal } from '@heroui/react';
import { useState } from 'react';
import { Typography } from '../../../../../../components/Typography';
import { TypographyVariant } from '../../../../../../components/Typography/constants';
import { filterRecipes } from '../../../../../../utils/filterRecipes';
import { PLANNER_COPY, PLANNER_INPUT_CLASS } from '../../constants';
import type { RecipePickerDialogProps } from './types';

export const RecipePickerDialog = ({ state, recipes, onPick }: RecipePickerDialogProps) => {
  const [query, setQuery] = useState('');
  const matches = filterRecipes({ recipes, query, tag: undefined });
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto" scroll="inside">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{PLANNER_COPY.pickerTitle}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-3">
                <input
                  type="search"
                  aria-label={PLANNER_COPY.pickerSearch}
                  placeholder={PLANNER_COPY.pickerSearch}
                  className={PLANNER_INPUT_CLASS}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {matches.length === 0 && (
                  <Typography variant={TypographyVariant.Caption}>
                    {PLANNER_COPY.pickerEmpty}
                  </Typography>
                )}
                <ul className="flex flex-col gap-1">
                  {matches.map((recipe) => (
                    <li key={recipe.id}>
                      <button
                        type="button"
                        onClick={() => onPick({ recipe })}
                        className="w-full cursor-pointer rounded-xl p-3 text-left outline-none hover:bg-default focus-visible:ring-2 focus-visible:ring-focus"
                      >
                        {recipe.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
