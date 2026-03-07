import { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useActor } from "./useActor";

export function useIsDeliveryPerson() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isDeliveryPerson"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isDeliveryPerson();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useAssignDeliveryRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalString: string) => {
      if (!actor) throw new Error("Actor not available");
      let principal: Principal;
      try {
        principal = Principal.fromText(principalString);
      } catch {
        throw new Error("Invalid principal ID format");
      }
      await actor.assignDeliveryRole(principal);
    },
    onSuccess: () => {
      toast.success("Delivery role assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["isDeliveryPerson"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to assign delivery role");
    },
  });
}
