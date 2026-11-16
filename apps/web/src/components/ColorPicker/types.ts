import type { ShopColor } from '../../services/shoppingList/constants';

type RequiredColor = {
  label: string;
  value: ShopColor;
  onChange: (color: ShopColor) => void;
  noneLabel?: undefined;
};

type OptionalColor = {
  label: string;
  value: ShopColor | undefined;
  onChange: (color: ShopColor | undefined) => void;
  noneLabel: string;
};

export type ColorPickerProps = RequiredColor | OptionalColor;
