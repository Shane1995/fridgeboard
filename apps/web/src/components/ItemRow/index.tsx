import { Checkbox, Dropdown } from '@heroui/react';
import { Ellipsis, Trash2 } from 'lucide-react';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import type { Shop, ListItem } from '../../services/shoppingList/types';
import { shopIdsOf } from '../../services/shoppingList/utils/shopIdsOf';
import { isPendingItem } from '../../services/shoppingList/utils/isPendingItem';
import { ItemInfoDialog } from '../ItemInfoDialog';
import { ShopSwatch } from '../ShopSwatch';
import {
  COARSE_POINTER_QUERY,
  COMBINE_ACTION,
  DELETE_ACTION,
  EDIT_MAX_LENGTH,
  INFO_ACTION,
  ITEM_ROW_COPY,
  MAX_SHOP_BADGES,
  SHOPS_ACTION,
  SPLIT_ACTION,
  SPLIT_OUT_ACTION,
} from './constants';
import { useItemRow } from './hooks/useItemRow';
import { useSwipeToDelete } from './hooks/useSwipeToDelete';

type ItemRowProps = {
  item: ListItem;
  shops: readonly Shop[];
  shopId?: string;
  rowRef?: Ref<HTMLLIElement>;
  rowProps?: HTMLAttributes<HTMLLIElement>;
  handle?: ReactNode;
  isDragging?: boolean;
};

export const ItemRow = ({
  item,
  shops,
  shopId,
  rowRef,
  rowProps,
  handle,
  isDragging = false,
}: ItemRowProps) => {
  const {
    infoDialog,
    isEditing,
    draft,
    setDraft,
    startEditing,
    commit,
    cancel,
    toggle,
    setShops,
    canSplitOut,
    canSplitAll,
    duplicateCount,
    handleMenuAction,
    remove,
  } = useItemRow({ item, shopId });
  const pending = isPendingItem(item);
  const canSwipe =
    !pending &&
    !isEditing &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(COARSE_POINTER_QUERY).matches;
  const swipe = useSwipeToDelete({ onDelete: remove, enabled: canSwipe && !isDragging });
  const splitOutLabel = ITEM_ROW_COPY.splitOut(shops.find(({ id }) => id === shopId)?.name ?? '');
  const elsewhere = item.shops.filter(({ id }) => id !== shopId);

  return (
    <li
      ref={rowRef}
      {...rowProps}
      className={`relative overflow-hidden text-base pointer-coarse:select-none pointer-coarse:[-webkit-touch-callout:none] ${isDragging ? 'opacity-40' : ''} ${pending ? 'opacity-60' : ''}`}
    >
      {swipe.isSwiping && (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-end bg-danger pr-6 text-white"
        >
          <Trash2
            size={20}
            className={`transition-transform motion-reduce:transition-none ${swipe.isArmed ? 'scale-125' : 'scale-90 opacity-80'}`}
          />
        </div>
      )}
      <div
        {...swipe.handlers}
        style={{ transform: swipe.offset === 0 ? undefined : `translateX(${swipe.offset}px)` }}
        className={`relative flex items-center gap-3 bg-white py-3 ${canSwipe ? 'touch-pan-y' : ''} ${swipe.isSwiping ? '' : 'transition-transform duration-200 motion-reduce:transition-none'}`}
      >
        <Checkbox
          aria-label={item.name}
          isSelected={item.checked}
          isDisabled={pending}
          onChange={toggle}
        >
          <Checkbox.Content>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
          </Checkbox.Content>
        </Checkbox>
        {isEditing ? (
          <form onSubmit={commit} className="flex-1">
            <input
              autoFocus
              aria-label={ITEM_ROW_COPY.edit}
              maxLength={EDIT_MAX_LENGTH}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={() => commit()}
              onKeyDown={(event) => event.key === 'Escape' && cancel()}
              className="w-full bg-transparent outline-none"
            />
          </form>
        ) : (
          <button
            type="button"
            onClick={startEditing}
            className={`flex-1 cursor-text text-left ${item.checked ? 'line-through opacity-60' : ''}`}
          >
            {item.name}
          </button>
        )}
        {elsewhere.length > 0 && (
          <span
            role="img"
            aria-label={ITEM_ROW_COPY.alsoIn(elsewhere.map(({ name }) => name))}
            className="flex shrink-0 items-center gap-1"
          >
            {elsewhere.slice(0, MAX_SHOP_BADGES).map(({ id, name, color }) => (
              <span key={id} className="rounded-full">
                <ShopSwatch color={color} name={name} />
              </span>
            ))}
            {elsewhere.length > MAX_SHOP_BADGES && (
              <span className="text-xs opacity-60">+{elsewhere.length - MAX_SHOP_BADGES}</span>
            )}
          </span>
        )}
        {!pending && handle && (
          <span onPointerDown={(event) => event.stopPropagation()} className="flex">
            {handle}
          </span>
        )}
        {pending ? (
          <span aria-hidden className="size-10 shrink-0" />
        ) : (
          <Dropdown>
            <Dropdown.Trigger
              aria-label={ITEM_ROW_COPY.menu}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full outline-none hover:bg-foreground/5"
            >
              <Ellipsis aria-hidden size={18} />
            </Dropdown.Trigger>
            <Dropdown.Popover>
              <Dropdown.Menu aria-label={ITEM_ROW_COPY.menu} onAction={handleMenuAction}>
                <Dropdown.Item id={INFO_ACTION} textValue={ITEM_ROW_COPY.info}>
                  {ITEM_ROW_COPY.info}
                </Dropdown.Item>
                {shops.length > 0 && (
                  <Dropdown.SubmenuTrigger>
                    <Dropdown.Item id={SHOPS_ACTION} textValue={ITEM_ROW_COPY.shops}>
                      {ITEM_ROW_COPY.shops}
                      <Dropdown.SubmenuIndicator />
                    </Dropdown.Item>
                    <Dropdown.Popover>
                      <Dropdown.Menu
                        aria-label={ITEM_ROW_COPY.shops}
                        selectionMode="multiple"
                        shouldCloseOnSelect={false}
                        selectedKeys={new Set(shopIdsOf(item))}
                        onSelectionChange={(keys) =>
                          setShops({
                            shopIds: keys instanceof Set ? [...keys].map(String) : [],
                          })
                        }
                      >
                        {shops.map(({ id, name, color }) => (
                          <Dropdown.Item key={id} id={id} textValue={name}>
                            <ShopSwatch color={color} name={name} />
                            {name}
                            <Dropdown.ItemIndicator />
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown.Popover>
                  </Dropdown.SubmenuTrigger>
                )}
                {canSplitOut && (
                  <Dropdown.Item id={SPLIT_OUT_ACTION} textValue={splitOutLabel}>
                    {splitOutLabel}
                  </Dropdown.Item>
                )}
                {canSplitAll && (
                  <Dropdown.Item id={SPLIT_ACTION} textValue={ITEM_ROW_COPY.splitAll}>
                    {ITEM_ROW_COPY.splitAll}
                  </Dropdown.Item>
                )}
                {duplicateCount > 0 && (
                  <Dropdown.Item
                    id={COMBINE_ACTION}
                    textValue={ITEM_ROW_COPY.combine(duplicateCount)}
                  >
                    {ITEM_ROW_COPY.combine(duplicateCount)}
                  </Dropdown.Item>
                )}
                <Dropdown.Item id={DELETE_ACTION} textValue={ITEM_ROW_COPY.delete} variant="danger">
                  {ITEM_ROW_COPY.delete}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        )}
        <ItemInfoDialog item={item} state={infoDialog} />
      </div>
    </li>
  );
};
