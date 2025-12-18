import { useContext } from 'react';
import { Link } from 'react-router';
import { DocumentIcon, ListBulletIcon } from '@heroicons/react/20/solid';
import { useModal } from '~/hooks/useModal';
import { usePlaylists } from '~/hooks/useExercises';
import EmptyState from './EmptyState';
import PlaylistTimer from './PlaylistTimer';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import type { PlaylistWithCount } from '~/services/superbaseDb';
import { Card, CardFooter, CardHeader, CardTitle } from './ui/card';

const PlaceholderCard = () => {
  return (
    <li className="col-span-1 flex rounded-md opacity-50">
      <div className="bg-gray-600 flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
        <DocumentIcon className="size-6 text-gray-400" />
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

const PlayListCardShad = ({
  playlist,
  handleClick,
}: {
  playlist: PlaylistWithCount;
  handleClick: () => void;
}) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{playlist.name}</CardTitle>
      </CardHeader>
      <CardFooter>
      <p className="text-gray-500 italic">
              {playlist.exercise_count}{' '}
              {playlist.exercise_count === 1 ? 'вправа' : 'вправ'}
            </p>
      </CardFooter>
    </Card>
  );
};

const PlayListCard = ({
  playlist,
  handleClick,
}: {
  playlist: PlaylistWithCount;
  handleClick: () => void;
}) => {
  return (
    <div onClick={handleClick} className="cursor-pointer">
      <li className="col-span-1 flex rounded-md hover:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5">
        <div className="bg-purple-700 flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
          <ListBulletIcon className="size-6 text-white" />
        </div>
        <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-white/10 bg-gray-800/50">
          <div className="flex-1 truncate px-4 py-2 text-sm">
            <div className="font-medium text-white hover:text-gray-200">
              {playlist.name}
            </div>
            <p className="text-gray-500 italic">
              {playlist.exercise_count}{' '}
              {playlist.exercise_count === 1 ? 'вправа' : 'вправ'}
            </p>
          </div>
          <div className="shrink-0 pr-2">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:text-white focus:outline-2 focus:outline-offset-2 focus:outline-white"
            >
              <span className="sr-only">Open options</span>
              <DocumentIcon aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
      </li>
    </div>
  );
};

const PlayLists = () => {
  const { openModal } = useModal();
  const { user, isAuthenticating } = useContext(SupabaseAuthContext);
  const { data: playlists = [], isLoading } = usePlaylists();

  const handleClickPlayList = (playlist: PlaylistWithCount) => {
    if (!playlist.exercise_ids || playlist.exercise_ids.length === 0) {
      return;
    }
    openModal('fullwindow', <PlaylistTimer playlist={playlist} />, {
      item: { name: playlist.name, id: playlist.id },
    });
  };

  const isAuthenticated = user !== null && user !== undefined;
  const showPlaceholders = !isAuthenticating && !isAuthenticated;

  if (showPlaceholders) {
    return (
      <div>
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-light">Списки вправ:</h2>
        </div>
        <div className="mt-3 rounded-md border border-white/10 bg-gray-800/30 p-4">
          <p className="text-sm text-gray-400">
            Щоб додати списки вправ необхідно{' '}
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

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-light">Списки вправ:</h2>
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

  if (!playlists || playlists.length === 0) {
    return (
      <div>
        <div className="flex items-center gap-x-2">
          <h2 className="text-lg font-light">Списки вправ:</h2>
        </div>
        <EmptyState
          title="Поки що немає списків вправ"
          description="Почати додавати списки вправ"
          buttonText="Додати список"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-x-2">
        <h2 className="text-lg font-light">Списки вправ:</h2>
      </div>

      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {playlists.map((playlist) => (
          // <PlayListCard
          //   handleClick={() => handleClickPlayList(playlist)}
          //   key={playlist.id}
          //   playlist={playlist}
          // />
          <PlayListCardShad
            handleClick={() => handleClickPlayList(playlist)}
            key={playlist.id}
            playlist={playlist}
          />
        ))}
      </ul>
    </div>
  );
};

export default PlayLists;
