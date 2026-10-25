import { Dropdown } from '@heroui/react';
import { ChevronDown, Store } from 'lucide-react';
import { ShopSwatch } from '../ShopSwatch';
import { MAX_SWATCHES, NO_SHOPS_ITEM_ID, SHOP_ASSIGNER_COPY } from './constants';
import type { ShopAssignerProps } from './types';

export const ShopAssigner = ({ shops, selectedIds, onChange }: ShopAssignerProps) => {
  const picked = shops.filter(({ id }) => selectedIds.includes(id));
  const names = picked.map(({ name }) => name);
  const label =
    names.length === 0
      ? SHOP_ASSIGNER_COPY.assign
      : `${SHOP_ASSIGNER_COPY.assign}: ${names.join(', ')}`;

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={label}
        className="flex max-w-44 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-foreground/5 px-2.5 py-2 text-sm font-medium outline-none md:rounded-xl md:px-3 md:py-2.5"
      >
        {picked.length === 0 && <Store aria-hidden size={16} className="shrink-0 opacity-60" />}
        {picked.length > 0 && (
          <span className="flex shrink-0 -space-x-1">
            {picked.slice(0, MAX_SWATCHES).map(({ id, color, name }) => (
              <span key={id} className="rounded-full ring-2 ring-white">
                <ShopSwatch color={color} name={name} />
              </span>
            ))}
          </span>
        )}
        <span className="truncate">
          {picked.length === 0 && SHOP_ASSIGNER_COPY.assign}
          {picked.length === 1 && picked[0]?.name}
          {picked.length > 1 && SHOP_ASSIGNER_COPY.count(picked.length)}
        </span>
        <ChevronDown aria-hidden size={14} className="shrink-0 opacity-60" />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label={SHOP_ASSIGNER_COPY.assign}
          selectionMode="multiple"
          selectedKeys={new Set(picked.map(({ id }) => id))}
          onSelectionChange={(keys) => onChange(keys instanceof Set ? [...keys].map(String) : [])}
        >
          {shops.length === 0 ? (
            <Dropdown.Item id={NO_SHOPS_ITEM_ID} isDisabled textValue={SHOP_ASSIGNER_COPY.noShops}>
              {SHOP_ASSIGNER_COPY.noShops}
            </Dropdown.Item>
          ) : (
            shops.map(({ id, name, color }) => (
              <Dropdown.Item key={id} id={id} textValue={name}>
                <ShopSwatch color={color} name={name} />
                {name}
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
