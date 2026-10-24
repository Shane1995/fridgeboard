import { BucketColor } from '../../../constants';
import { toBucket } from './index';

describe('toBucket', () => {
  it('keeps the fields and turns the colour name into the colour', () => {
    expect(toBucket({ id: 'b1', name: 'Aldi', color: 'sky', order: 2 })).toEqual({
      id: 'b1',
      name: 'Aldi',
      color: BucketColor.Sky,
      order: 2,
    });
  });

  it('falls back to slate for a colour this build does not know', () => {
    expect(toBucket({ id: 'b1', name: 'Aldi', color: 'beige' as never, order: 0 }).color).toBe(
      BucketColor.Slate,
    );
  });
});
