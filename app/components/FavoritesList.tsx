import { useContext } from 'react';
import { Link } from 'react-router';
import { MusicalNoteIcon } from '@heroicons/react/20/solid';
import Card from './Card';
import PracticeItem from './RunExercise';
import { useExercises } from '~/hooks/useExercises';
import { useModal } from '~/hooks/useModal';
import type { Exercise } from '~/types/exercise';
import EmptyState from './EmptyState';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import RunExercise from './RunExercise';

const PlaceholderCard = () => {
  return (
    <li className="col-span-1 flex rounded-md opacity-50">
      <div className="bg-gray-600 flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
        <MusicalNoteIcon className="size-6 text-gray-400" />
      </div>
      <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-white/10 bg-gray-800/50">
        <div className="flex-1 truncate px-4 py-2 text-sm">
          <div className="font-medium text-gray-500">&nbsp;</div>
          <p className="text-gray-600">&nbsp;</p>
        </div>
        <div className="shrink-0 pr-2">
          <div className="inline-flex size-8 items-center justify-center rounded-full text-gray-600">
            <span className="sr-only">Open options</span>
          </div>
        </div>
      </div>
    </li>
  );
};

const FavoritesList = () => {
  const { openModal } = useModal();
  const { user, isAuthenticating } = useContext(SupabaseAuthContext);
  const {
    data: exercises = [],
    isLoading,
    isFetching,
  } = useExercises({ favorite: true });

  const handleClickFavorites = (exercise: Exercise) => {
    openModal('fullwindow', <RunExercise exercise={exercise} />, { exercise });
  };

  const isAuthenticated = user !== null && user !== undefined;
  const showPlaceholders = !isAuthenticating && !isAuthenticated;

  if (showPlaceholders) {
    return (
      <div>
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-light uppercase">Улюблені:</h2>
        </div>
        <div className="mt-3 rounded-md border border-white/10 bg-gray-800/30 p-4">
          <p className="text-sm text-gray-400">
            Щоб додати улюблені вправи необхідно{' '}
            <Link
              to="/login"
              className="font-medium text-white underline hover:text-gray-200"
            >
              авторизуватися
            </Link>
          </p>
        </div>
        <ul
          role="list"
          className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <PlaceholderCard key={`placeholder-${index}`} />
          ))}
        </ul>
      </div>
    );
  }

  if (isLoading && exercises.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-light uppercase">Улюблені:</h2>
        </div>
        <p className="mt-3 text-gray-400">Завантаження...</p>
      </div>
    );
  }

  if (!exercises || exercises.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-light uppercase">Улюблені:</h2>
        </div>
        <EmptyState
          title="Поки що немає улюблених"
          description="Почати додавати вправи до улюблених"
          buttonText="Додати вправу"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-x-2">
        <h2 className="text-lg font-light uppercase">Улюблені:</h2>
      </div>

      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {exercises.map((exercise) => (
          <Card
            handleClick={() => handleClickFavorites(exercise)}
            key={exercise.id}
            exercise={exercise}
          />
        ))}
      </ul>
      {/* <Devider buttonText="Add Item" /> */}
    </div>
  );
};

export default FavoritesList;
