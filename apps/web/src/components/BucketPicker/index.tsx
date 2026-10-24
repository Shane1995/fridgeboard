import { Dropdown } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import type { Bucket } from '../../services/shoppingList/types';
import { BucketSwatch } from '../BucketSwatch';
import { BUCKET_PICKER_COPY } from './constants';

type BucketPickerProps = {
  buckets: readonly Bucket[];
  bucketId: string;
  onChange: (bucketId: string) => void;
};

export const BucketPicker = ({ buckets, bucketId, onChange }: BucketPickerProps) => {
  const selected = buckets.find(({ id }) => id === bucketId);

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={`${BUCKET_PICKER_COPY.label}: ${selected?.name}`}
        className="flex max-w-36 shrink-0 cursor-pointer items-center gap-2 rounded-lg bg-foreground/5 px-2.5 py-2 text-sm font-medium outline-none md:rounded-xl md:px-3 md:py-2.5"
      >
        {selected && <BucketSwatch color={selected.color} />}
        <span className="truncate">{selected?.name}</span>
        <ChevronDown aria-hidden size={14} className="shrink-0 opacity-60" />
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          aria-label={BUCKET_PICKER_COPY.label}
          selectionMode="single"
          selectedKeys={new Set([bucketId])}
          onSelectionChange={(keys) => {
            const [first] = keys instanceof Set ? [...keys] : [];
            if (first !== undefined) {
              onChange(String(first));
            }
          }}
        >
          {buckets.map(({ id, name, color }) => (
            <Dropdown.Item key={id} id={id} textValue={name}>
              <BucketSwatch color={color} />
              {name}
              <Dropdown.ItemIndicator />
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
};
