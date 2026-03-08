import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PromoCode, Variant_fixed_percentage } from "../backend";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useGetAllPromoCodes() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<PromoCode[]>({
    queryKey: ["promoCodes"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPromoCodes();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useCreatePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      description,
    }: {
      code: string;
      discountType: Variant_fixed_percentage;
      discountValue: bigint;
      minOrderAmount: bigint;
      maxUses: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPromoCode(
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
}

export function useEditPromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      description,
    }: {
      code: string;
      discountType: Variant_fixed_percentage;
      discountValue: bigint;
      minOrderAmount: bigint;
      maxUses: bigint;
      description: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.editPromoCode(
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxUses,
        description,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
}

export function useDeletePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deletePromoCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
}

export function useTogglePromoCode() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.togglePromoCode(code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promoCodes"] });
    },
  });
}

export function useValidatePromoCode() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      code,
      orderTotal,
    }: {
      code: string;
      orderTotal: bigint;
    }): Promise<PromoCode | null> => {
      if (!actor) throw new Error("Actor not available");
      return actor.validatePromoCode(code, orderTotal);
    },
  });
}
