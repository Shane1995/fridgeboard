import { ShopColor } from '../../services/shoppingList/constants';

export const SHOP_COLOR_CLASSES: Record<ShopColor, string> = {
  [ShopColor.Tomato]: 'bg-[#e2462f]',
  [ShopColor.Mustard]: 'bg-[#edb02b]',
  [ShopColor.Mint]: 'bg-[#26a383]',
  [ShopColor.Sky]: 'bg-[#3b82c4]',
  [ShopColor.Grape]: 'bg-[#8b5cb8]',
  [ShopColor.Pink]: 'bg-[#d63f80]',
  [ShopColor.Slate]: 'bg-[#6b7885]',
  [ShopColor.Black]: 'bg-[#1f1f1f]',
  [ShopColor.Forest]: 'bg-[#17603f]',
  [ShopColor.Lime]: 'bg-[#78be20]',
  [ShopColor.Orange]: 'bg-[#f06c00]',
  [ShopColor.Navy]: 'bg-[#0f3f8c]',
  [ShopColor.Cyan]: 'bg-[#00a3dd]',
  [ShopColor.Yellow]: 'bg-[#f9d71c]',
};

export type SwatchSize = 'sm' | 'md' | 'lg';

export const SWATCH_SIZE_CLASSES: Record<SwatchSize, string> = {
  sm: 'size-3',
  md: 'size-5',
  lg: 'size-8',
};

export const SHOP_TEXT_CLASSES: Record<ShopColor, string> = {
  [ShopColor.Tomato]: 'text-white',
  [ShopColor.Mustard]: 'text-foreground',
  [ShopColor.Mint]: 'text-white',
  [ShopColor.Sky]: 'text-white',
  [ShopColor.Grape]: 'text-white',
  [ShopColor.Pink]: 'text-white',
  [ShopColor.Slate]: 'text-white',
  [ShopColor.Black]: 'text-white',
  [ShopColor.Forest]: 'text-white',
  [ShopColor.Lime]: 'text-foreground',
  [ShopColor.Orange]: 'text-white',
  [ShopColor.Navy]: 'text-white',
  [ShopColor.Cyan]: 'text-foreground',
  [ShopColor.Yellow]: 'text-foreground',
};
