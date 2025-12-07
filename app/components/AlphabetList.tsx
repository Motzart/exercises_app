import { HeartIcon, StarIcon } from '@heroicons/react/16/solid';
import React, { useMemo } from 'react';
import { useSetFavoriteExercise } from '~/hooks/useExercises';
import type { Exercise } from '~/types/exercise';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatDuration(seconds: number): string {
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)} хвилин`;
}

const Stars = ({ rating }: { rating: number }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-0.5 w-[100px]">
      {[...Array(full)].map((_, i) => (
        <StarIcon key={i} className="size-4 text-yellow-400" />
      ))}
      {half && <StarIcon className="size-3 text-yellow-400" />}
    </div>
  );
};

export default function AlphabetList({
  exercises,
  onItemClick,
}: {
  exercises: Exercise[];
  onItemClick: (exercises: Exercise) => void;
}) {
  const setFavoriteItemMutation = useSetFavoriteExercise();

  // Grouping and sorting
  const grouped = useMemo(() => {
    const sorted = [...exercises].sort((a, b) => a.name.localeCompare(b.name));

    return sorted.reduce((acc: Record<string, Exercise[]>, item) => {
      const letter = item.name[0].toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(item);
      return acc;
    }, {});
  }, [exercises]);

  const letters = Object.keys(grouped);

  const handleFavoriteClick = (
    e: React.MouseEvent,
    exerciseId: string,
    currentFavorite: boolean,
  ) => {
    e.stopPropagation();
    setFavoriteItemMutation.mutate({
      exerciseId,
      isFavorite: !currentFavorite,
    });
  };

  return (
    <div className="w-full mx-auto">
      {letters.map((letter) => (
        <div key={letter} className="mb-6">
          {/* Заголовок секции */}
          <div className="bg-gray-800 text-white px-3 py-1 rounded font-semibold sticky top-0">
            {letter}
          </div>

          {/* Элементы */}
          <div className="mt-2 flex flex-col gap-3">
            {grouped[letter].map((exercise) => (
              <div
                onClick={() => onItemClick(exercise)}
                key={exercise.id}
                className="bg-gray-700 text-white p-4 border-b border-white/10 flex justify-between items-center hover:bg-gray-800/50 cursor-pointer"
              >
                {/* Левая часть */}
                <div className="flex flex-col gap-1">
                  {/* Название */}
                  <div className="flex items-center gap-2">
                    {exercise.favorite ? (
                      <HeartIcon
                        onClick={(e) =>
                          handleFavoriteClick(e, exercise.id, exercise.favorite)
                        }
                        className="size-6 text-red-400 cursor-pointer"
                      />
                    ) : (
                      <HeartIcon
                        onClick={(e) =>
                          handleFavoriteClick(e, exercise.id, exercise.favorite)
                        }
                        className="size-6 text-gray-400 cursor-pointer"
                      />
                    )}
                    <span className="text-lg font-semibold">
                      {exercise.name}
                    </span>
                  </div>
                  <div className="flex flex-row gap-2">
                    {/* Рейтинг ⭐ */}
                    {/* <Stars rating={item.rating} /> */}

                    {/* Последняя практика */}
                    {exercise.lastSession && (
                      <span className="italic text-sm text-gray-300">
                        Востаннє практикувався:{' '}
                        {formatDate(exercise.lastSession.created_at)}
                      </span>
                    )}

                    {/* Время */}
                    {exercise.lastSession && (
                      <span className="italic text-sm text-gray-400">
                        на протязі{' '}
                        {formatDuration(exercise.lastSession.duration_seconds)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Три точки */}
                <button className="text-gray-300 text-2xl px-2">⋮</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
