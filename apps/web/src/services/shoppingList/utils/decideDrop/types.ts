import type { ListItem } from '../../types';

export type DecideDropOptions = { item: ListItem; fromShopId: string; toShopId: string };

export type DropDecision = { kind: 'none' | 'assign' | 'unassign' | 'already' | 'ask' };
