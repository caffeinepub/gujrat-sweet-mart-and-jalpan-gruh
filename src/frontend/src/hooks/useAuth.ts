import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [retryCount, setRetryCount] = useState(0);

  const query = useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString(), retryCount],
    queryFn: async () => {
      if (!actor || !identity) return false;

      const principal = identity.getPrincipal();
      if (principal.isAnonymous()) return false;

      try {
        const result = await actor.isCallerAdmin();
        // Schedule a retry if not yet admin (registration may still be in progress)
        if (result === false && retryCount < 3) {
          setRetryCount((prev) => prev + 1);
        }
        return result;
      } catch (_error: unknown) {
        // Backend may trap if user not yet registered — treat as non-admin, retry
        if (retryCount < 3) {
          setRetryCount((prev) => prev + 1);
        }
        return false;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: false,
    staleTime: 30000,
  });

  // Auto-retry with delay when result is false (may not be registered yet)
  const refetch = query.refetch;
  const data = query.data;
  useEffect(() => {
    if (data === false && retryCount > 0 && retryCount <= 3) {
      const timer = setTimeout(() => {
        refetch();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [retryCount, data, refetch]);

  return query;
}
