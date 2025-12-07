import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession } from '~/services/superbaseDb';
import type { CreateSessionInput } from '~/types/exercise';

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (session: CreateSessionInput) => createSession(session),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

