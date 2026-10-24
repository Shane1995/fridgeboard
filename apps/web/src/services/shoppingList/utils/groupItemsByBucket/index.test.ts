import { BucketColor, UNSORTED_BUCKET_ID } from '../../constants';
import type { Bucket, ListItem } from '../../types';
import { groupItemsByBucket } from './index';

const bucket = (id: string, order: number): Bucket => ({
  id,
  name: id,
  color: BucketColor.Mint,
  order,
});
const item = (id: string, bucketId: string, checked = false): ListItem => ({
  id,
  name: id,
  bucketId,
  checked,
  createdAt: 0,
});

describe('groupItemsByBucket', () => {
  it('keeps empty buckets and hides an empty General', () => {
    const { sections } = groupItemsByBucket([bucket('b1', 0)], []);

    expect(sections.map(({ bucket: { id } }) => id)).toEqual(['b1']);
  });

  it('puts items in their bucket, in the order given', () => {
    const { sections } = groupItemsByBucket(
      [bucket('b1', 0), bucket('b2', 1)],
      [item('a', 'b2'), item('b', 'b1'), item('c', 'b2')],
    );

    expect(sections.map(({ items }) => items.map(({ id }) => id))).toEqual([['b'], ['a', 'c']]);
  });

  it('shows General first once it has items, including orphaned ones', () => {
    const { sections } = groupItemsByBucket(
      [bucket('b1', 0)],
      [item('a', UNSORTED_BUCKET_ID), item('b', 'deleted')],
    );

    expect(sections.map(({ bucket: { id } }) => id)).toEqual([UNSORTED_BUCKET_ID, 'b1']);
    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('moves ticked items out of their bucket into checked', () => {
    const { sections, checked } = groupItemsByBucket(
      [bucket('b1', 0)],
      [item('a', 'b1', true), item('b', 'b1')],
    );

    expect(sections[0]?.items.map(({ id }) => id)).toEqual(['b']);
    expect(checked.map(({ id }) => id)).toEqual(['a']);
  });
});
