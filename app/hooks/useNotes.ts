import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, deleteNote, getNotes } from '~/services/superbaseDb';
import type { CreateNoteInput, Note } from '~/types/exercise';

export function useNotes(exerciseId?: string | null) {
  return useQuery({
    queryKey: ['notes', exerciseId],
    queryFn: async () => {
      return await getNotes(exerciseId);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (note: CreateNoteInput) => createNote(note),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['notes', variables.exercise_id],
      });
    },
  });
}

export function useDeleteNote(exerciseId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', exerciseId] });
    },
  });
}
