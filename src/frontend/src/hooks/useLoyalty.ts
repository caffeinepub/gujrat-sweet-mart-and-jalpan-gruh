import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export interface LoyaltyAccount {
  confirmedPoints: bigint;
  pendingPoints: bigint;
}

export interface LoyaltyTransaction {
  txId: bigint;
  txType:
    | { __kind__: "earned" }
    | { __kind__: "redeemed" }
    | { __kind__: "reversed" }
    | { __kind__: "finalized" }
    | { __kind__: "adminAdjustment" };
  points: bigint;
  orderId: bigint | null;
  reason: string;
  timestamp: bigint;
}

export function useGetMyLoyaltyAccount() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<LoyaltyAccount>({
    queryKey: ["loyaltyAccount"],
    queryFn: async () => {
      if (!actor) return { confirmedPoints: 0n, pendingPoints: 0n };
      return (actor as any).getMyLoyaltyAccount();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetMyLoyaltyTransactions() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<LoyaltyTransaction[]>({
    queryKey: ["loyaltyTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMyLoyaltyTransactions();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetMaxRedeemablePoints(
  orderTotal: bigint,
  principalStr: string | null,
) {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ["maxRedeemablePoints", orderTotal.toString(), principalStr],
    queryFn: async () => {
      if (!actor || !identity || !principalStr) return 0n;
      const principal = identity.getPrincipal();
      return (actor as any).getMaxRedeemablePoints(orderTotal, principal);
    },
    enabled:
      !!actor && !isFetching && !!identity && !!principalStr && orderTotal > 0n,
  });
}

export function useAdminGetLoyaltyAccount() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).adminGetLoyaltyAccount(
        principal,
      ) as Promise<LoyaltyAccount>;
    },
  });
}

export function useAdminAdjustPoints() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      principal,
      delta,
      reason,
    }: {
      principal: Principal;
      delta: bigint;
      reason: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).adminAdjustPoints(principal, delta, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loyaltyAccount"] });
    },
  });
}
