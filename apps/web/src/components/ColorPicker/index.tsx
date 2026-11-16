import { ShopColor } from '../../services/shoppingList/constants';
import { ShopSwatch } from '../ShopSwatch';
import type { ColorPickerProps } from './types';

const OPTION_CLASS =
  'cursor-pointer rounded-full p-1 outline-none transition-transform hover:scale-110 aria-pressed:ring-2 aria-pressed:ring-foreground aria-pressed:ring-offset-2';

// One colour out of the shared palette, as a row of tappable swatches. Pass `noneLabel` to let the
// user go back to having no colour of their own.
export const ColorPicker = (props: ColorPickerProps) => {
  const { label, value } = props;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div role="group" aria-label={label} className="flex flex-wrap items-center gap-3">
        {props.noneLabel !== undefined && (
          <button
            type="button"
            aria-pressed={value === undefined}
            onClick={() => props.onChange(undefined)}
            className={`${OPTION_CLASS} rounded-full border border-separator px-3 py-1 text-sm`}
          >
            {props.noneLabel}
          </button>
        )}
        {Object.values(ShopColor).map((option) => (
          <button
            key={option}
            type="button"
            aria-label={option}
            aria-pressed={option === value}
            onClick={() => props.onChange(option)}
            className={OPTION_CLASS}
          >
            <ShopSwatch color={option} size="lg" />
          </button>
        ))}
      </div>
    </div>
  );
};
