import { useContext } from 'react';
import { Link } from 'react-router';
import { DocumentIcon, ListBulletIcon } from '@heroicons/react/20/solid';
import { TrashIcon } from '@heroicons/react/16/solid';
import CircleButton from '~/components/CircleButton';
import CreatePlaylist from '~/components/CreatePlaylist';
import { useModal } from '~/hooks/useModal';
import { usePlaylists, useDeletePlaylist } from '~/hooks/useExercises';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import EmptyState from '~/components/EmptyState';
import type { PlaylistWithCount } from '~/services/superbaseDb';
import { DataTable } from '~/components/data-table';
import data from '../dashboard/data.json';
import { PlayListTable } from '~/components/PlayListTable';

const PlaceholderCard = () => {
  return (
    <li className="flex w-full rounded-md opacity-50">
      <div className="bg-gray-600 flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
        <DocumentIcon className="size-6 text-gray-400" />
      </div>
      <div className="flex flex-1 items-center justify-between rounded-r-md border-t border-r border-b border-white/10 bg-gray-800/50">
        <div className="flex-1 px-4 py-2 text-sm">
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

interface PlayListCardProps {
  playlist: PlaylistWithCount;
  onDelete: (playlistId: string) => void;
  isDeleting: boolean;
}

const PlayListCard = ({
  playlist,
  onDelete,
  isDeleting,
}: PlayListCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(`Ви впевнені, що хочете видалити плейлист "${playlist.name}"?`)
    ) {
      onDelete(playlist.id);
    }
  };

  return (
    <li className="flex w-full rounded-md hover:bg-gray-800/50 shadow-lg hover:shadow-xl transition-all duration-200">
      <div className="bg-purple-700 flex w-16 shrink-0 items-center justify-center rounded-l-md text-sm font-medium text-white">
        <ListBulletIcon className="size-6 text-white" />
      </div>
      <div className="flex flex-1 items-center justify-between rounded-r-md border-t border-r border-b border-white/10 bg-gray-800/50">
        <div className="flex-1 px-4 py-2 text-sm">
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
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex size-8 items-center justify-center rounded-full text-gray-400 hover:text-red-400 focus:outline-2 focus:outline-offset-2 focus:outline-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Видалити плейлист"
          >
            <TrashIcon aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </li>
  );
};

const PlayListsPage = () => {
  const { openModal } = useModal();
  const { user, isAuthenticating } = useContext(SupabaseAuthContext);
  const { data: playlists = [], isLoading } = usePlaylists();
  const deletePlaylistMutation = useDeletePlaylist();

  const handleOpenCreateModal = () => {
    openModal('regular', <CreatePlaylist />);
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (
      window.confirm(
        `Ви впевнені, що хочете видалити плейлист "${playlist?.name || playlistId}"?`,
      )
    ) {
      try {
        await deletePlaylistMutation.mutateAsync(playlistId);
      } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('Помилка при видаленні плейлисту');
      }
    }
  };

  return (
    <div className="pt-4">
      <PlayListTable
        data={playlists}
        onAdd={handleOpenCreateModal}
        onEdit={() => {}}
        onDelete={handleDeletePlaylist}
      />
    </div>
  );
};

export default PlayListsPage;
