import { ShopDropZone } from '../ShopDropZone';
import { ShopSection } from '../ShopSection';
import type { ShopCardProps } from './types';

export const ShopCard = ({ section, allShops, draggable, quickAdd }: ShopCardProps) =>
  draggable ? (
    <ShopDropZone shopId={section.shop.id}>
      <ShopSection section={section} allShops={allShops} draggable quickAdd={quickAdd} />
    </ShopDropZone>
  ) : (
    <ShopSection section={section} allShops={allShops} quickAdd={quickAdd} />
  );
