import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      console.log('=== useIsCallerAdmin Query Starting ===');
      console.log('Actor available:', !!actor);
      console.log('Identity available:', !!identity);
      
      if (!actor || !identity) {
        console.log('Missing actor or identity, returning false');
        return false;
      }

      const principal = identity.getPrincipal().toString();
      console.log('Checking admin status for principal:', principal);

      try {
        const result = await actor.isCallerAdmin();
        console.log('Backend isCallerAdmin() returned:', result);
        console.log('Result type:', typeof result);
        return result;
      } catch (error: any) {
        console.error('Error calling isCallerAdmin():', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}
