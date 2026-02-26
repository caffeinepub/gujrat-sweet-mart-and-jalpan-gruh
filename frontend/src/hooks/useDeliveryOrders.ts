import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Order, OrderStatus } from '../backend';
import { toast } from 'sonner';

export function useGetActiveOrdersForDelivery() {
  const { actor, isFetching } = useActor();

  return useQuery<Order[]>({
    queryKey: ['deliveryOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActiveOrdersForDelivery();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateOrderStatusByDelivery() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: bigint; newStatus: OrderStatus }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateOrderStatusByDeliveryPerson(orderId, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryOrders'] });
      toast.success('Order status updated successfully');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to update order status');
    },
  });
}
