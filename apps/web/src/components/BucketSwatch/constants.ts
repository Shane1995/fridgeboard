import { BucketColor } from '../../services/shoppingList/constants';

export const BUCKET_COLOR_CLASSES: Record<BucketColor, string> = {
  [BucketColor.Tomato]: 'bg-[#e2462f]',
  [BucketColor.Mustard]: 'bg-[#edb02b]',
  [BucketColor.Mint]: 'bg-[#26a383]',
  [BucketColor.Sky]: 'bg-[#3b82c4]',
  [BucketColor.Grape]: 'bg-[#8b5cb8]',
  [BucketColor.Pink]: 'bg-[#d63f80]',
  [BucketColor.Slate]: 'bg-[#6b7885]',
};

export type SwatchSize = 'sm' | 'lg';

export const SWATCH_SIZE_CLASSES: Record<SwatchSize, string> = {
  sm: 'size-3',
  lg: 'size-8',
};

export const BUCKET_TEXT_CLASSES: Record<BucketColor, string> = {
  [BucketColor.Tomato]: 'text-white',
  [BucketColor.Mustard]: 'text-foreground',
  [BucketColor.Mint]: 'text-white',
  [BucketColor.Sky]: 'text-white',
  [BucketColor.Grape]: 'text-white',
  [BucketColor.Pink]: 'text-white',
  [BucketColor.Slate]: 'text-white',
};
