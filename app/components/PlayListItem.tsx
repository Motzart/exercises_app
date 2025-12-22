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
import { Link } from 'react-router';
import type { PlaylistWithCount } from '~/services/superbaseDb';
import { formatDate } from '~/utils';

interface PlayListItemProps {
  playlist: PlaylistWithCount;
}

function PlayListItem({ playlist }: PlayListItemProps) {
  return (
    <Item
      variant="outline"
      asChild
      role="listitem"
      className="bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-400 dark:hover:border-blue-500 [a]:hover:bg-transparent"
    >
      <Link
        to={`/play-lists/${playlist.id}`}
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
      </Link>
    </Item>
  );
}

export function PlayListItems({
  playlists,
}: {
  playlists: PlaylistWithCount[];
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ItemGroup className="gap-4">
        {playlists.map((playlist) => (
          <PlayListItem
            key={playlist.id}
            playlist={playlist}
          />
        ))}
      </ItemGroup>
    </div>
  );
}

export default PlayListItem;
