import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      console.log('🔐 ========================================');
      console.log('🔐 === useIsCallerAdmin Query Starting ===');
      console.log('🔐 ========================================');
      console.log('🔐 Timestamp:', new Date().toISOString());
      console.log('🔐 Actor available:', !!actor);
      console.log('🔐 Identity available:', !!identity);
      console.log('🔐 Actor fetching:', isFetching);
      
      if (!actor) {
        console.log('🔐 ❌ No actor available, returning false');
        console.log('🔐 === useIsCallerAdmin Query Complete (No Actor) ===');
        return false;
      }

      if (!identity) {
        console.log('🔐 ❌ No identity available, returning false');
        console.log('🔐 === useIsCallerAdmin Query Complete (No Identity) ===');
        return false;
      }

      const principal = identity.getPrincipal();
      const principalString = principal.toString();
      const isAnonymous = principal.isAnonymous();
      
      console.log('🔐 Authentication State:');
      console.log('  - Principal:', principalString);
      console.log('  - Is Anonymous:', isAnonymous);
      console.log('  - Principal Length:', principalString.length);

      if (isAnonymous) {
        console.warn('🔐 ⚠️ WARNING: Calling isCallerAdmin with anonymous principal!');
      }

      try {
        console.log('🔐 📞 Calling actor.isCallerAdmin()...');
        const startTime = Date.now();
        
        const result = await actor.isCallerAdmin();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('🔐 ========================================');
        console.log('🔐 === Backend Response Received ===');
        console.log('🔐 ========================================');
        console.log('🔐 Raw Result:', result);
        console.log('🔐 Result Type:', typeof result);
        console.log('🔐 Result Value:', JSON.stringify(result));
        console.log('🔐 Is Boolean:', typeof result === 'boolean');
        console.log('🔐 Is True:', result === true);
        console.log('🔐 Is False:', result === false);
        console.log('🔐 Is Null:', result === null);
        console.log('🔐 Is Undefined:', result === undefined);
        console.log('🔐 Call Duration:', duration, 'ms');
        console.log('🔐 ========================================');
        
        if (result === true) {
          console.log('🔐 ✅ Admin check PASSED - User IS admin');
        } else if (result === false) {
          console.log('🔐 ❌ Admin check FAILED - User is NOT admin');
        } else {
          console.warn('🔐 ⚠️ Unexpected result type:', result);
        }
        
        console.log('🔐 === useIsCallerAdmin Query Complete ===');
        return result;
      } catch (error: any) {
        console.log('🔐 ========================================');
        console.error('🔐 === ERROR in isCallerAdmin Call ===');
        console.log('🔐 ========================================');
        console.error('🔐 Error Object:', error);
        console.error('🔐 Error Type:', typeof error);
        console.error('🔐 Error Constructor:', error?.constructor?.name);
        console.error('🔐 Error Message:', error?.message);
        console.error('🔐 Error Stack:', error?.stack);
        
        if (error?.message) {
          console.error('🔐 Parsed Error Message:', error.message);
          if (error.message.includes('Unauthorized')) {
            console.error('🔐 ⚠️ AUTHORIZATION ERROR detected in message');
          }
          if (error.message.includes('trap')) {
            console.error('🔐 ⚠️ BACKEND TRAP detected in message');
          }
        }
        
        console.log('🔐 === useIsCallerAdmin Query Failed ===');
        throw error;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 1,
    staleTime: 30000,
  });
}
