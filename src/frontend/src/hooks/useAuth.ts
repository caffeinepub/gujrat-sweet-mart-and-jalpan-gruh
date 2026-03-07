import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRetry, setShouldRetry] = useState(false);

  const query = useQuery<boolean>({
    queryKey: ["isAdmin", identity?.getPrincipal().toString(), retryCount],
    queryFn: async () => {
      console.log("🔐 ========================================");
      console.log("🔐 === useIsCallerAdmin Query Starting ===");
      console.log("🔐 ========================================");
      console.log("🔐 Timestamp:", new Date().toISOString());
      console.log("🔐 Retry Count:", retryCount);
      console.log("🔐 Actor available:", !!actor);
      console.log("🔐 Identity available:", !!identity);
      console.log("🔐 Actor fetching:", isFetching);

      if (!actor) {
        console.log("🔐 ❌ No actor available, returning false");
        console.log("🔐 === useIsCallerAdmin Query Complete (No Actor) ===");
        return false;
      }

      if (!identity) {
        console.log("🔐 ❌ No identity available, returning false");
        console.log("🔐 === useIsCallerAdmin Query Complete (No Identity) ===");
        return false;
      }

      const principal = identity.getPrincipal();
      const principalString = principal.toString();
      const isAnonymous = principal.isAnonymous();

      console.log("🔐 Authentication State:");
      console.log("  - Principal:", principalString);
      console.log("  - Is Anonymous:", isAnonymous);
      console.log("  - Principal Length:", principalString.length);

      if (isAnonymous) {
        console.warn(
          "🔐 ⚠️ WARNING: Calling isCallerAdmin with anonymous principal!",
        );
        return false;
      }

      try {
        console.log("🔐 📞 Calling actor.isCallerAdmin()...");
        const startTime = Date.now();

        const result = await actor.isCallerAdmin();

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log("🔐 ========================================");
        console.log("🔐 === Backend Response Received ===");
        console.log("🔐 ========================================");
        console.log("🔐 Raw Result:", result);
        console.log("🔐 Result Type:", typeof result);
        console.log("🔐 Result Value:", JSON.stringify(result));
        console.log("🔐 Call Duration:", duration, "ms");
        console.log("🔐 ========================================");

        if (result === true) {
          console.log("🔐 ✅ Admin check PASSED - User IS admin");
          setShouldRetry(false);
        } else if (result === false) {
          console.log("🔐 ❌ Admin check FAILED - User is NOT admin");

          // If this is the first authenticated user and result is false, schedule a retry
          if (retryCount < 3) {
            console.log(
              "🔐 🔄 Scheduling retry in 1.5 seconds... (attempt",
              retryCount + 1,
              "of 3)",
            );
            setShouldRetry(true);
          } else {
            console.log("🔐 ⛔ Max retries reached, accepting result as final");
            setShouldRetry(false);
          }
        } else {
          console.warn("🔐 ⚠️ Unexpected result type:", result);
        }

        console.log("🔐 === useIsCallerAdmin Query Complete ===");
        return result;
      } catch (error: any) {
        console.log("🔐 ========================================");
        console.error("🔐 === ERROR in isCallerAdmin Call ===");
        console.log("🔐 ========================================");
        console.error("🔐 Error Object:", error);
        console.error("🔐 Error Type:", typeof error);
        console.error("🔐 Error Constructor:", error?.constructor?.name);
        console.error("🔐 Error Message:", error?.message);
        console.error("🔐 Error Stack:", error?.stack);

        if (error?.message) {
          console.error("🔐 Parsed Error Message:", error.message);
          if (error.message.includes("Unauthorized")) {
            console.error("🔐 ⚠️ AUTHORIZATION ERROR detected in message");
          }
          if (error.message.includes("trap")) {
            console.error("🔐 ⚠️ BACKEND TRAP detected in message");
          }
        }

        console.log("🔐 === useIsCallerAdmin Query Failed ===");
        throw error;
      }
    },
    enabled: !!actor && !!identity && !isFetching,
    retry: 1,
    staleTime: 30000,
  });

  // Retry logic with delay
  useEffect(() => {
    if (shouldRetry && query.data === false && retryCount < 3) {
      const timer = setTimeout(() => {
        console.log("🔐 🔄 Executing retry now...");
        setRetryCount((prev) => prev + 1);
        setShouldRetry(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [shouldRetry, query.data, retryCount]);

  return query;
}
