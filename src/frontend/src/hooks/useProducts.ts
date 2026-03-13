import { useQuery } from "@tanstack/react-query";
import type { Product } from "../backend";
import { useActor } from "./useActor";

export function useGetAllProducts() {
  const { actor, isFetching: isActorFetching } = useActor();

  const query = useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!actor && !isActorFetching,
  });

  return {
    ...query,
    // Show loading spinner while actor is initializing OR while products are fetching
    isLoading: isActorFetching || query.isLoading || query.isFetching,
  };
}
