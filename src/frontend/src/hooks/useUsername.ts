import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useCallerUsername() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<string | null>({
    queryKey: ["callerUsername"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUsername();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSetUsername() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.setUsername(username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerUsername"] });
    },
  });
}

export function useCheckUsernameAvailable() {
  const { actor } = useActor();

  return async (username: string): Promise<boolean> => {
    if (!actor) throw new Error("Actor not available");
    return actor.checkUsernameAvailable(username);
  };
}
