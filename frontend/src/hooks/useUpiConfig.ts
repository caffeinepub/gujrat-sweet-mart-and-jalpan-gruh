import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UpiConfig } from '../backend';
import { ExternalBlob } from '../backend';

export function useGetUpiConfig() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UpiConfig | null>({
    queryKey: ['upiConfig'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getUpiConfig();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useSetUpiConfig() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: { upiId: string; qrCodeBytes: Uint8Array<ArrayBuffer> }) => {
      if (!actor) throw new Error('Actor not available');
      const qrCode = ExternalBlob.fromBytes(config.qrCodeBytes);
      const upiConfig: UpiConfig = {
        upiId: config.upiId,
        qrCode,
      };
      return actor.setUpiConfig(upiConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upiConfig'] });
    },
  });
}
