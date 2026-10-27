import { Button, Modal } from '@heroui/react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { FORM_INPUT_CLASS } from '../RecipeForm/constants';
import { IDEAS_DIALOG_COPY } from './constants';
import { useIdeas } from './hooks/useIdeas';
import type { IdeasDialogProps } from './types';

export const IdeasDialog = ({ state, onImport }: IdeasDialogProps) => {
  const { prompt, setPrompt, ideas, ticked, handleSearch, toggle, importSelected } = useIdeas({
    onImport,
    onDone: state.close,
  });
  return (
    <Modal state={state}>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{IDEAS_DIALOG_COPY.title}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex items-end gap-2">
                  <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
                    {IDEAS_DIALOG_COPY.label}
                    <input
                      className={FORM_INPUT_CLASS}
                      placeholder={IDEAS_DIALOG_COPY.placeholder}
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                    />
                  </label>
                  <Button type="submit" variant="primary">
                    {IDEAS_DIALOG_COPY.search}
                  </Button>
                </form>
                {ideas.length === 0 ? (
                  <Typography variant={TypographyVariant.Caption}>
                    {IDEAS_DIALOG_COPY.empty}
                  </Typography>
                ) : (
                  <ul aria-label={IDEAS_DIALOG_COPY.resultsLabel} className="flex flex-col gap-2">
                    {ideas.map((idea) => (
                      <li key={idea.id}>
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-separator p-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={ticked.includes(idea.id)}
                            onChange={() => toggle({ id: idea.id })}
                          />
                          <span className="flex min-w-0 flex-col">
                            <span className="font-semibold">{idea.title}</span>
                            <span className="text-xs opacity-60">{idea.site}</span>
                            <span className="text-sm opacity-80">{idea.snippet}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <Typography variant={TypographyVariant.Caption}>
                  {IDEAS_DIALOG_COPY.note}
                </Typography>
                <Button
                  variant="primary"
                  fullWidth
                  isDisabled={ticked.length === 0}
                  onPress={importSelected}
                >
                  {IDEAS_DIALOG_COPY.importSelected}
                  {ticked.length > 0 && ` (${ticked.length})`}
                </Button>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
