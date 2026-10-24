import { BucketColor, UNSORTED_BUCKET_ID, UNSORTED_BUCKET_NAME } from '../../constants';
import type { Bucket, GroupedItems, ListItem } from '../../types';

export const UNSORTED_BUCKET: Bucket = {
  id: UNSORTED_BUCKET_ID,
  name: UNSORTED_BUCKET_NAME,
  color: BucketColor.Slate,
  order: Number.MAX_SAFE_INTEGER,
};

export const groupItemsByBucket = (
  buckets: readonly Bucket[],
  items: readonly ListItem[],
): GroupedItems => {
  const known = new Set(buckets.map(({ id }) => id));
  const open = items.filter(({ checked }) => !checked);
  const bucketOf = ({ bucketId }: ListItem) =>
    known.has(bucketId) ? bucketId : UNSORTED_BUCKET_ID;
  const sectionFor = (bucket: Bucket) => ({
    bucket,
    items: open.filter((item) => bucketOf(item) === bucket.id),
  });
  const unsorted = sectionFor(UNSORTED_BUCKET);
  return {
    sections: [...(unsorted.items.length > 0 ? [unsorted] : []), ...buckets.map(sectionFor)],
    checked: items.filter(({ checked }) => checked),
  };
};
