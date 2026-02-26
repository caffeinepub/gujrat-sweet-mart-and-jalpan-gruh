import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { CustomerProfile } from '../backend';
import { useInternetIdentity } from './useInternetIdentity';

export function useGetCustomerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<CustomerProfile | null>({
    queryKey: ['customerProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCustomerProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCustomerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, phone, address }: { name: string; phone: string; address: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCustomerProfile(name, phone, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
  });
}
