import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Category, ProductId, Unit } from '../backend';

interface AddProductParams {
  name: string;
  category: Category;
  description: string;
  price: bigint;
  available: boolean;
  unit: Unit;
  photoUrl: string;
}

interface EditProductParams {
  productId: ProductId;
  name: string;
  category: Category;
  description: string;
  price: bigint;
  available: boolean;
  unit: Unit;
  photoUrl: string;
}

export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddProductParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addProduct(
        params.name,
        params.category,
        params.description,
        params.price,
        params.available,
        params.unit,
        params.photoUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: EditProductParams) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editProduct(
        params.productId,
        params.name,
        params.category,
        params.description,
        params.price,
        params.available,
        params.unit,
        params.photoUrl
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: ProductId) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
