import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from '~/components/ui/item';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { HeartIcon } from '@heroicons/react/16/solid';
import type { Exercise } from '~/types/exercise';
import { formatDate, formatDuration } from '~/utils';

export function ExercisesList({
  exercises,
  onItemClick,
  onEdit,
  onDelete,
}: {
  exercises: Exercise[];
  onItemClick?: (exercises: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
}) {
  return (
    <div className="flex w-full flex-col gap-6">
      <ItemGroup className="gap-4">
        {exercises.map((ex) => (
          <Item key={ex.name} variant="outline" asChild role="listitem">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onItemClick(ex);
              }}
            >
              <ItemMedia variant="image">
                <HeartIcon className="size-6 text-gray-400" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">{ex.name}</ItemTitle>
                <ItemDescription>
                  {/* Последняя практика */}
                  {ex.lastSession && (
                    <span className="italic text-sm">
                      Востаннє практикувався:{' '}
                      {formatDate(ex.lastSession.created_at)}
                    </span>
                  )}

                  {/* Время */}
                  {ex.lastSession && (
                    <span className="italic text-sm">
                      {' '}
                      - на протязі{' '}
                      {formatDuration(ex.lastSession.duration_seconds)}
                    </span>
                  )}
                </ItemDescription>
              </ItemContent>
              <ItemContent className="flex-none text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-300 text-2xl px-2 hover:text-white focus:outline-none cursor-pointer"
                  >
                    ⋮
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(ex);
                        }}
                      >
                        Редагувати
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(ex);
                        }}
                      >
                        Видалити
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemContent>
            </a>
          </Item>
        ))}
      </ItemGroup>
    </div>
  );
}
