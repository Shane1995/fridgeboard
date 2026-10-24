import { useQueryClient } from '@tanstack/react-query';
import type { MutationName } from '../../services/configuration/schema/constants';
import type { ShoppingListRepository } from '../../services/shoppingList/types';
import { useMutation } from '../useMutation';
import type { MutationResult } from '../useMutation/types';
import { requireRepository, useShoppingList } from '../useShoppingList';

export const useShoppingListMutation = <TData, TVariables = void>(
  name: MutationName,
  write: (repository: ShoppingListRepository, variables: TVariables) => Promise<TData>,
  invalidates: readonly string[],
): MutationResult<TData, TVariables> => {
  const queryClient = useQueryClient();
  const { repository } = useShoppingList();
  return useMutation({
    mutationKey: [name],
    mutationFn: async (variables: TVariables) => {
      const data = await write(requireRepository(repository), variables);
      await Promise.all(
        invalidates.map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
      );
      return data;
    },
  });
};
