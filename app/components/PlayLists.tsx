import { useContext } from 'react';
import { Link } from 'react-router';
import { DocumentIcon, ListBulletIcon } from '@heroicons/react/20/solid';
import { useModal } from '~/hooks/useModal';
import EmptyState from './EmptyState';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';

const itemsPlayList = [
  {
    name: 'Warming Up',
    initials: 'GA',
    href: '#',
    members: 4,
    bgColor: 'bg-purple-700',
  },
  {
    name: 'Єтюд Бертіні',
    initials: 'GA',
    href: '#',
    members: 3,
    bgColor: 'bg-purple-700',
  },
  {
    name: 'Ганон 7,8,9',
    initials: 'GA',
    href: '#',
    members: 3,
    bgColor: 'bg-purple-700',
  },
  {
    name: 'Play List 2',
    initials: 'CD',
    href: '#',
    members: 3,
    bgColor: 'bg-purple-700',
  },
];

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

interface PlayListItem {
  name: string;
  initials: string;
  href: string;
  members: number;
  bgColor: string;
}

const PlayListCard = ({
  playlist,
  handleClick,
}: {
  playlist: PlayListItem;
  handleClick: () => void;
}) => {
  return (
    <div onClick={handleClick} className="cursor-pointer">
      <li className="col-span-1 flex rounded-md hover:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5">
        <div
          className={`${playlist.bgColor} flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white`}
        >
          <ListBulletIcon className="size-6 text-white" />
        </div>
        <div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-white/10 bg-gray-800/50">
          <div className="flex-1 truncate px-4 py-2 text-sm">
            <div className="font-medium text-white hover:text-gray-200">
              {playlist.name}
            </div>
            <p className="text-gray-500 italic">
              {playlist.members} {playlist.members === 1 ? 'вправа' : 'вправ'}
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

  const handleClickPlayList = (playlist: PlayListItem) => {
    // TODO: Implement modal for playlist
    console.log('Open playlist:', playlist);
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

  if (!itemsPlayList || itemsPlayList.length === 0) {
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
        {itemsPlayList.map((playlist, index) => (
          <PlayListCard
            handleClick={() => handleClickPlayList(playlist)}
            key={`playlist-${index}`}
            playlist={playlist}
          />
        ))}
      </ul>
    </div>
  );
};

export default PlayLists;

