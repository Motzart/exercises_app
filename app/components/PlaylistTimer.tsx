import { useState } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { useModal } from '~/hooks/useModal';
import { useExercisesByIds } from '~/hooks/useExercises';
import OwnTimer from './OwnTimer';
import type { PlaylistWithCount } from '~/services/superbaseDb';

interface PlaylistTimerProps {
  playlist: PlaylistWithCount;
}

function PlaylistTimer({ playlist }: PlaylistTimerProps) {
  const { closeAllModals } = useModal();
  const { data: exercises = [], isLoading } = useExercisesByIds(
    playlist.exercise_ids || [],
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  const currentExercise = exercises[currentExerciseIndex] || null;

  const handleExerciseClick = (index: number) => {
    setCurrentExerciseIndex(index);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Завантаження...</div>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white">Немає вправ у плейлисті</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 grid-rows-1">
      {/* Main timer area - 2/3 of screen */}
      <div className="col-span-3">
        <OwnTimer onClose={closeAllModals} exercise={currentExercise} />
      </div>

      {/* Drawer - 1/3 of screen - 2 */}
      <div className="col-span-2 col-start-4">
        <div className="px-10">
          <ul
            role="list"
            className="divide-y divide-white/10 overflow-hidden rounded-md border border-white/10 bg-gray-800/30"
          >
            {exercises.map((exercise, index) => {
              const isActive = index === currentExerciseIndex;

              return (
                <li key={exercise.id}>
                  <button
                    type="button"
                    onClick={() => handleExerciseClick(index)}
                    aria-current={isActive ? 'true' : undefined}
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition ${
                      isActive
                        ? 'bg-gray-800/60 text-white'
                        : 'text-gray-300 hover:bg-gray-800/40'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">
                        {index + 1}. {exercise.name}
                      </div>
                      {exercise.description ? (
                        <div className="mt-1 line-clamp-2 text-xs text-gray-400">
                          {exercise.description}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isActive ? (
                        <CheckIcon className="size-5 text-green-400" />
                      ) : (
                        <span className="text-xs text-gray-500">next</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PlaylistTimer;
