import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createExercise,
  deleteExercise,
  getExercises,
  getSessionsByDay,
  setFavoriteItem,
  updateExercise,
} from '~/services/superbaseDb';
import type {
  CreateExerciseInput,
  DaySessions,
  Exercise,
} from '~/types/exercise';

interface UseItemsFilters {
  favorite?: boolean;
}

export function useExercises(filters?: UseItemsFilters) {
  return useQuery({
    queryKey: ['exercises', filters],
    queryFn: async () => {
      const { data, error } = await getExercises(filters);

      if (error) {
        throw new Error(error.message || 'Failed to fetch items');
      }

      return data as Exercise[];
    },
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSetFavoriteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      isFavorite,
    }: {
      exerciseId: string;
      isFavorite: boolean;
    }) => setFavoriteItem(exerciseId, isFavorite),
    onMutate: async ({ exerciseId, isFavorite }) => {
      // Отменяем исходящие запросы, чтобы они не перезаписали оптимистичное обновление
      await queryClient.cancelQueries({ queryKey: ['exercises'] });

      // Сохраняем все предыдущие значения для отката
      const queryCache = queryClient.getQueryCache();
      const previousDataMap = new Map();

      queryCache.findAll({ queryKey: ['exercises'] }).forEach((query) => {
        const previousData = queryClient.getQueryData<Exercise[]>(
          query.queryKey,
        );
        if (previousData) {
          previousDataMap.set(query.queryKey, previousData);
          // Оптимистично обновляем каждый кеш
          queryClient.setQueryData<Exercise[]>(query.queryKey, (old) => {
            if (!old) return old;
            return old.map((item) =>
              item.id === exerciseId ? { ...item, favorite: isFavorite } : item,
            );
          });
        }
      });

      // Возвращаем контекст с предыдущими данными для отката
      return { previousDataMap };
    },
    onError: (err, variables, context) => {
      // Откатываем изменения в случае ошибки
      if (context?.previousDataMap) {
        context.previousDataMap.forEach((previousData, queryKey) => {
          queryClient.setQueryData(queryKey, previousData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exercise: CreateExerciseInput) => createExercise(exercise),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercisesCount'] });
    },
  });
}

export function useSessionsByDay() {
  return useQuery({
    queryKey: ['sessionsByDay'],
    queryFn: async () => {
      return await getSessionsByDay();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (exerciseId: string) => deleteExercise(exerciseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      queryClient.invalidateQueries({ queryKey: ['exercisesCount'] });
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      exerciseId,
      updates,
    }: {
      exerciseId: string;
      updates: Partial<Pick<Exercise, 'name' | 'favorite' | 'description'>>;
    }) => updateExercise(exerciseId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });
}
