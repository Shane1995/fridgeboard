import { Button, Modal, useOverlayState } from '@heroui/react';
import { ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { Typography } from '../../../../components/Typography';
import { TypographyVariant } from '../../../../components/Typography/constants';
import { RECIPES_COPY } from '../../constants';
import { formatIngredient } from '../../utils/formatIngredient';
import type { RecipeDetailProps } from './types';

export const RecipeDetail = ({
  recipe,
  onBack,
  onEdit,
  onDelete,
  onToggleFavourite,
}: RecipeDetailProps) => {
  const confirm = useOverlayState();
  return (
    <article className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onPress={onBack}>
          <ArrowLeft aria-hidden size={18} />
          {RECIPES_COPY.back}
        </Button>
        <button
          type="button"
          aria-label={recipe.isFavourite ? RECIPES_COPY.favouriteOn : RECIPES_COPY.favouriteOff}
          aria-pressed={recipe.isFavourite}
          onClick={() => onToggleFavourite({ id: recipe.id })}
          className="cursor-pointer rounded-full p-2 outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Star
            aria-hidden
            size={24}
            className={recipe.isFavourite ? 'fill-warning text-warning' : 'opacity-40'}
          />
        </button>
      </div>
      <header className="flex flex-col gap-1">
        <Typography variant={TypographyVariant.Heading2} as="h2">
          {recipe.name}
        </Typography>
        <Typography variant={TypographyVariant.Caption}>
          {RECIPES_COPY.serves} {recipe.servings}
          {recipe.tags.length > 0 && ` · ${recipe.tags.join(', ')}`}
        </Typography>
        {recipe.sourceUrl !== '' && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-accent underline"
          >
            {RECIPES_COPY.source}
            <ExternalLink aria-hidden size={14} />
          </a>
        )}
      </header>
      <section aria-label={RECIPES_COPY.ingredients} className="flex flex-col gap-2">
        <Typography variant={TypographyVariant.Heading3} as="h3">
          {RECIPES_COPY.ingredients}
        </Typography>
        <ul className="flex flex-col gap-1">
          {recipe.ingredients.map((ingredient) => (
            <li key={ingredient.id}>{formatIngredient({ ingredient })}</li>
          ))}
        </ul>
      </section>
      <section aria-label={RECIPES_COPY.method} className="flex flex-col gap-2">
        <Typography variant={TypographyVariant.Heading3} as="h3">
          {RECIPES_COPY.method}
        </Typography>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          {recipe.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
      {recipe.notes !== '' && (
        <section aria-label={RECIPES_COPY.notes} className="flex flex-col gap-1">
          <Typography variant={TypographyVariant.Heading3} as="h3">
            {RECIPES_COPY.notes}
          </Typography>
          <Typography>{recipe.notes}</Typography>
        </section>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" onPress={() => onEdit({ id: recipe.id })}>
          {RECIPES_COPY.edit}
        </Button>
        <Button variant="danger-soft" onPress={confirm.open}>
          {RECIPES_COPY.delete}
        </Button>
      </div>
      <Modal state={confirm}>
        <Modal.Backdrop>
          <Modal.Container placement="auto">
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>{RECIPES_COPY.confirmTitle}</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <div className="flex flex-col gap-4">
                  <Typography>{RECIPES_COPY.confirmBody}</Typography>
                  <Button
                    variant="danger"
                    fullWidth
                    onPress={() => {
                      confirm.close();
                      onDelete({ id: recipe.id });
                    }}
                  >
                    {RECIPES_COPY.confirmDelete}
                  </Button>
                  <Button variant="secondary" fullWidth onPress={confirm.close}>
                    {RECIPES_COPY.confirmCancel}
                  </Button>
                </div>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </article>
  );
};
