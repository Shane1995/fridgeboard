import { Plus } from 'lucide-react';
import { ITEM_NAME_MAX_LENGTH, UNSORTED_SHOP_ID } from '../../services/shoppingList/constants';
import { SHOP_QUICK_ADD_COPY } from './constants';
import { useQuickAdd } from './hooks/useQuickAdd';
import type { ShopQuickAddProps } from './types';

export const ShopQuickAdd = ({ shop }: ShopQuickAddProps) => {
  const { isOpen, name, open, close, setName, handleSubmit, handleKeyDown } = useQuickAdd({
    shopId: shop.id,
  });
  const isUnassigned = shop.id === UNSORTED_SHOP_ID;

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={open}
        className="flex min-h-11 w-full cursor-pointer items-center gap-2 border-t border-foreground/5 text-sm opacity-60 outline-none hover:opacity-100"
      >
        <Plus aria-hidden size={16} />
        {isUnassigned
          ? SHOP_QUICK_ADD_COPY.triggerUnassigned
          : SHOP_QUICK_ADD_COPY.trigger(shop.name)}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex min-h-11 items-center border-t border-foreground/5"
    >
      <input
        autoFocus
        aria-label={SHOP_QUICK_ADD_COPY.inputLabel}
        placeholder={
          isUnassigned
            ? SHOP_QUICK_ADD_COPY.placeholderUnassigned
            : SHOP_QUICK_ADD_COPY.placeholder(shop.name)
        }
        maxLength={ITEM_NAME_MAX_LENGTH}
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={close}
        className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:opacity-40"
      />
    </form>
  );
};
