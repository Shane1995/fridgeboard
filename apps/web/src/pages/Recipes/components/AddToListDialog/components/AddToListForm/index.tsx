import { Button } from '@heroui/react';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { ShopSwatch } from '../../../../../../components/ShopSwatch';
import { Typography } from '../../../../../../components/Typography';
import { TypographyVariant } from '../../../../../../components/Typography/constants';
import { MOCK_SHOPS } from '../../../../../../services/recipes/constants';
import { formatIngredient } from '../../../../utils/formatIngredient';
import { ADD_TO_LIST_COPY } from '../../constants';
import { useAddToList } from './hooks/useAddToList';
import type { AddToListFormProps } from './types';

const CHIP_CLASS =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-separator px-2.5 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-focus aria-pressed:border-accent aria-pressed:bg-accent/10';

export const AddToListForm = ({ recipe, onDone }: AddToListFormProps) => {
  const {
    servings,
    factor,
    lines,
    count,
    changeServings,
    toggleTick,
    toggleShop,
    swapShop,
    submit,
  } = useAddToList({ recipe, onDone });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Typography variant={TypographyVariant.Strong} as="span">
          {ADD_TO_LIST_COPY.servings} {servings}
        </Typography>
        <div className="flex gap-1">
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            aria-label={ADD_TO_LIST_COPY.fewer}
            onPress={() => changeServings({ by: -1 })}
          >
            <Minus aria-hidden size={16} />
          </Button>
          <Button
            isIconOnly
            size="sm"
            variant="secondary"
            aria-label={ADD_TO_LIST_COPY.more}
            onPress={() => changeServings({ by: 1 })}
          >
            <Plus aria-hidden size={16} />
          </Button>
        </div>
      </div>
      <ul className="flex flex-col gap-3">
        {lines.map(({ ingredient, suggestion, onList, row }) => {
          const text = formatIngredient({ ingredient, factor });
          const swaps = (suggestion?.alternativeShopIds ?? []).filter(
            (shopId) => !row.shopIds.includes(shopId),
          );
          const isSuggestion =
            suggestion !== undefined &&
            row.shopIds.length === 1 &&
            row.shopIds[0] === suggestion.shopId;
          return (
            <li
              key={ingredient.id}
              className="flex flex-col gap-2 rounded-xl border border-separator p-3"
            >
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  aria-label={`${ADD_TO_LIST_COPY.tick} ${text}`}
                  checked={row.ticked && !onList}
                  disabled={onList}
                  onChange={() => toggleTick({ id: ingredient.id })}
                />
                <span className="font-medium">{text}</span>
                {onList && <span className="text-xs opacity-60">{ADD_TO_LIST_COPY.onList}</span>}
              </label>
              {!onList && (
                <>
                  <div
                    role="group"
                    aria-label={`${ADD_TO_LIST_COPY.shopsLabel} ${ingredient.item}`}
                    className="flex flex-wrap gap-1.5"
                  >
                    {MOCK_SHOPS.map((shop) => (
                      <button
                        key={shop.id}
                        type="button"
                        aria-pressed={row.shopIds.includes(shop.id)}
                        onClick={() => toggleShop({ id: ingredient.id, shopId: shop.id })}
                        className={CHIP_CLASS}
                      >
                        <ShopSwatch color={shop.color} size="sm" />
                        {shop.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {isSuggestion && (
                      <span className="inline-flex items-center gap-1 opacity-70">
                        <Sparkles aria-hidden size={12} />
                        {ADD_TO_LIST_COPY.suggested}
                      </span>
                    )}
                    {swaps.map((shopId) => {
                      const shop = MOCK_SHOPS.find((candidate) => candidate.id === shopId);
                      return (
                        <Button
                          key={shopId}
                          size="sm"
                          variant="ghost"
                          onPress={() => swapShop({ id: ingredient.id, shopId })}
                        >
                          {ADD_TO_LIST_COPY.swapTo} {shop?.name}
                        </Button>
                      );
                    })}
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>
      <Button variant="primary" fullWidth isDisabled={count === 0} onPress={submit}>
        {ADD_TO_LIST_COPY.submit(count)}
      </Button>
    </div>
  );
};
