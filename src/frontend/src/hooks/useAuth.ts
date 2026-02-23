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
      console.log('Timestamp:', new Date().toISOString());
      console.log('Actor available:', !!actor);
      console.log('Actor type:', typeof actor);
      console.log('Identity available:', !!identity);
      console.log('isFetching:', isFetching);
      
      if (!actor || !identity) {
        console.log('Missing actor or identity, returning false');
        console.log('  - Actor:', actor);
        console.log('  - Identity:', identity);
        return false;
      }

      const principal = identity.getPrincipal().toString();
      console.log('Checking admin status for principal:', principal);
      console.log('Actor methods available:', Object.keys(actor).filter(k => typeof (actor as any)[k] === 'function'));
      console.log('Has isCallerAdmin method:', typeof actor.isCallerAdmin === 'function');

      try {
        console.log('Calling actor.isCallerAdmin()...');
        const result = await actor.isCallerAdmin();
        console.log('✅ Backend isCallerAdmin() returned:', result);
        console.log('Result type:', typeof result);
        console.log('Result is boolean:', typeof result === 'boolean');
        console.log('Result === true:', result === true);
        console.log('Result === false:', result === false);
        console.log('=== useIsCallerAdmin Query Complete ===');
        return result;
      } catch (error: any) {
        console.error('❌ Error calling isCallerAdmin():');
        console.error('Error object:', error);
        console.error('Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error stack:', error.stack);
        if (error.response) {
          console.error('Error response:', error.response);
        }
        if (error.request) {
          console.error('Error request:', error.request);
        }
        console.log('=== useIsCallerAdmin Query Failed ===');
        throw error;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
  });
}
