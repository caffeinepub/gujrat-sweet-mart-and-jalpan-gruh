import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { HomepageConfig, ExternalBlob } from '../backend';
import { toast } from 'sonner';

export function useGetHomepageConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<HomepageConfig | null>({
    queryKey: ['homepageConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHomepageConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateHomepageConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      logoBytes: Uint8Array<ArrayBuffer> | null;
      existingLogo: ExternalBlob | null;
      address: string;
      hours: string;
      phone: string;
    }) => {
      if (!actor) throw new Error('Actor not available');

      let logo: ExternalBlob;
      if (params.logoBytes) {
        logo = ExternalBlob.fromBytes(params.logoBytes);
      } else if (params.existingLogo) {
        logo = params.existingLogo;
      } else {
        throw new Error('No logo provided');
      }

      const config: HomepageConfig = {
        logo,
        address: params.address,
        hours: params.hours,
        phone: params.phone,
      };

      return actor.updateHomepageConfig(config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageConfig'] });
      toast.success('Homepage configuration saved successfully!');
    },
    onError: (error) => {
      console.error('Failed to update homepage config:', error);
      toast.error('Failed to save homepage configuration. Please try again.');
    },
  });
}
