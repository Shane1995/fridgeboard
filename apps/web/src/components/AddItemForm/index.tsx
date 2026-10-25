import { Plus } from 'lucide-react';
import { ITEM_NAME_MAX_LENGTH } from '../../services/shoppingList/constants';
import { useAutoFocus } from '../../hooks/useAutoFocus';
import { ShopAssigner } from '../ShopAssigner';
import { ADD_ITEM_COPY } from './constants';
import { useAddItemForm } from './hooks/useAddItemForm';

type AddItemFormProps = { focusedShopId?: string | undefined };

export const AddItemForm = ({ focusedShopId }: AddItemFormProps) => {
  const {
    name,
    setName,
    highlighted,
    handleKeyDown,
    shopIds,
    setShopIds,
    shops,
    suggestions,
    pickSuggestion,
    isAdding,
    handleSubmit,
  } = useAddItemForm(focusedShopId);
  const inputRef = useAutoFocus<HTMLInputElement>();

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-white p-1.5 pl-3 shadow-sm focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 md:rounded-2xl md:p-2 md:pl-4"
      >
        <input
          ref={inputRef}
          aria-label={ADD_ITEM_COPY.inputLabel}
          placeholder={ADD_ITEM_COPY.placeholder}
          maxLength={ITEM_NAME_MAX_LENGTH}
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent py-1 text-base outline-none placeholder:opacity-40 md:py-2 md:text-lg"
        />
        <ShopAssigner shops={shops} selectedIds={shopIds} onChange={setShopIds} />
        <button
          type="submit"
          aria-label={ADD_ITEM_COPY.submit}
          disabled={isAdding}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg md:size-11 md:rounded-xl bg-accent text-white transition-transform active:scale-95 disabled:opacity-60"
        >
          <Plus aria-hidden size={18} />
        </button>
      </form>
      {suggestions.length > 0 && (
        <ul
          aria-label={ADD_ITEM_COPY.suggestions}
          className="absolute inset-x-3 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-foreground/10 bg-white py-1 shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <li key={suggestion.name}>
              <button
                type="button"
                onClick={() => pickSuggestion(suggestion)}
                aria-current={index === highlighted}
                className="w-full cursor-pointer px-4 py-2 text-left hover:bg-black/5 aria-[current=true]:bg-black/5"
              >
                {suggestion.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
