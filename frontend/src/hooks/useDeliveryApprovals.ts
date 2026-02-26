import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';

export function usePendingDeliveryProfiles() {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['pendingDeliveryProfiles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPendingDeliveryProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useApproveDeliveryPrincipal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.approveDeliveryPrincipal(principal);
    },
    onSuccess: () => {
      toast.success('Delivery access approved successfully');
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveryProfiles'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to approve delivery access');
    },
  });
}

export function useRejectDeliveryPrincipal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.rejectDeliveryPrincipal(principal);
    },
    onSuccess: () => {
      toast.success('Delivery access rejected');
      queryClient.invalidateQueries({ queryKey: ['pendingDeliveryProfiles'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to reject delivery access');
    },
  });
}
