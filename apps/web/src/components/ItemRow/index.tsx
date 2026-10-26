import { Checkbox, Dropdown } from '@heroui/react';
import { Ellipsis } from 'lucide-react';
import type { ReactNode, Ref } from 'react';
import { UNSORTED_SHOP_ID } from '../../services/shoppingList/constants';
import type { Shop, ListItem } from '../../services/shoppingList/types';
import { isPendingItem } from '../../services/shoppingList/utils/isPendingItem';
import { ItemInfoDialog } from '../ItemInfoDialog';
import { ShopSwatch } from '../ShopSwatch';
import {
  COMBINE_ACTION,
  DELETE_ACTION,
  EDIT_MAX_LENGTH,
  INFO_ACTION,
  ITEM_ROW_COPY,
  MAX_SHOP_BADGES,
  SHOPS_ACTION,
  SPLIT_ACTION,
} from './constants';
import { useItemRow } from './hooks/useItemRow';

type ItemRowProps = {
  item: ListItem;
  shops: readonly Shop[];
  shopId?: string;
  rowRef?: Ref<HTMLLIElement>;
  handle?: ReactNode;
  isDragging?: boolean;
};

export const ItemRow = ({
  item,
  shops,
  shopId,
  rowRef,
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
    canSplit,
    duplicateCount,
    handleMenuAction,
  } = useItemRow(item);
  const pending = isPendingItem(item);
  const elsewhere = shops.filter(
    ({ id }) => id !== UNSORTED_SHOP_ID && id !== shopId && item.shopIds.includes(id),
  );

  return (
    <li
      ref={rowRef}
      className={`flex items-center gap-3 py-3 text-base ${isDragging ? 'opacity-40' : ''} ${pending ? 'opacity-60' : ''}`}
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
      {!pending && handle}
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
                      selectedKeys={new Set(item.shopIds)}
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
              {canSplit && (
                <Dropdown.Item id={SPLIT_ACTION} textValue={ITEM_ROW_COPY.split}>
                  {ITEM_ROW_COPY.split}
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
    </li>
  );
};
