import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '~/components/ui/item';
import { ListBulletIcon } from '@heroicons/react/16/solid';
import { IconCalendarEvent } from '@tabler/icons-react';
import type { PlaylistWithCount } from '~/services/superbaseDb';
import { formatDate } from '~/utils';

interface PlayListItemProps {
  playlist: [];
  onItemClick: (playlist: any) => void;
}

function PlayListItem({ playlist, onItemClick }: PlayListItemProps) {
  return (
    <Item
      variant="outline"
      asChild
      role="listitem"
      className="bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-500 [a]:hover:bg-transparent"
    >
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onItemClick(playlist);
        }}
      >
        <ItemMedia variant="image">
          <ListBulletIcon className="size-6 text-blue-500 dark:text-blue-400" />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">{playlist.name}</ItemTitle>
          <ItemDescription>
            <span className="italic text-sm flex items-center gap-2">
              <IconCalendarEvent className="size-4 text-gray-400" />
              {formatDate(playlist.created_at)}
              <span className="text-gray-400">•</span>
              <span>
                {playlist.exercise_count}{' '}
                {playlist.exercise_count === 1 ? 'вправа' : 'вправ'}
              </span>
            </span>
          </ItemDescription>
        </ItemContent>
      </a>
    </Item>
  );
}

export function PlayListItems({
  playlists,
  onItemClick,
}: {
  playlists: PlaylistWithCount[];
  onItemClick: (playlist: PlaylistWithCount) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ItemGroup className="gap-4">
        {playlists.map((playlist) => (
          <PlayListItem
            key={playlist.id}
            playlist={playlist}
            onItemClick={onItemClick}
          />
        ))}
      </ItemGroup>
    </div>
  );
}

export default PlayListItem;
