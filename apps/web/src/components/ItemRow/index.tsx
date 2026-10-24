import { Checkbox, Dropdown } from '@heroui/react';
import { Ellipsis } from 'lucide-react';
import type { Shop, ListItem } from '../../services/shoppingList/types';
import { ItemInfoDialog } from '../ItemInfoDialog';
import {
  DELETE_ACTION,
  EDIT_MAX_LENGTH,
  INFO_ACTION,
  ITEM_ROW_COPY,
  MOVE_ACTION,
  MOVE_ACTION_PREFIX,
} from './constants';
import { useItemRow } from './hooks/useItemRow';

type ItemRowProps = { item: ListItem; moveTargets: readonly Shop[] };

export const ItemRow = ({ item, moveTargets }: ItemRowProps) => {
  const {
    infoDialog,
    isEditing,
    draft,
    setDraft,
    startEditing,
    commit,
    cancel,
    toggle,
    handleMenuAction,
  } = useItemRow(item);

  return (
    <li className="flex items-center gap-3 py-3 text-base">
      <Checkbox aria-label={item.name} isSelected={item.checked} onChange={toggle}>
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
            {moveTargets.length > 0 && (
              <Dropdown.SubmenuTrigger>
                <Dropdown.Item id={MOVE_ACTION} textValue={ITEM_ROW_COPY.move}>
                  {ITEM_ROW_COPY.move}
                  <Dropdown.SubmenuIndicator />
                </Dropdown.Item>
                <Dropdown.Popover>
                  <Dropdown.Menu aria-label={ITEM_ROW_COPY.moveTo} onAction={handleMenuAction}>
                    {moveTargets.map(({ id, name }) => (
                      <Dropdown.Item key={id} id={`${MOVE_ACTION_PREFIX}${id}`} textValue={name}>
                        {name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown.SubmenuTrigger>
            )}
            <Dropdown.Item id={DELETE_ACTION} textValue={ITEM_ROW_COPY.delete} variant="danger">
              {ITEM_ROW_COPY.delete}
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <ItemInfoDialog item={item} state={infoDialog} />
    </li>
  );
};
