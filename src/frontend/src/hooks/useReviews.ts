import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export interface Review {
  reviewId: bigint;
  productId: bigint;
  customerPrincipal: Principal;
  rating: bigint; // 1-5
  comment: string;
  timestamp: bigint; // nanoseconds
}

export function useGetReviewsForProduct(productId: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Review[]>({
    queryKey: ["reviews", productId?.toString()],
    queryFn: async () => {
      if (!actor || productId === null) return [];
      return (actor as any).getReviewsForProduct(productId);
    },
    enabled: !!actor && !isFetching && productId !== null,
  });
}

export function useGetAllReviews() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Review[]>({
    queryKey: ["allReviews"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAllReviews();
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useSubmitReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
    }: {
      productId: bigint;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).submitReview(productId, rating, comment);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", variables.productId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    },
  });
}

export function useDeleteReview() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reviewId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return (actor as any).deleteReview(reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["allReviews"] });
    },
  });
}
