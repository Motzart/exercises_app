import * as React from 'react';
import {
  IconDotsVertical,
  IconPlus,
  IconStar,
  IconStarFilled,
} from '@tabler/icons-react';
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table';

import { useIsMobile } from '~/hooks/use-mobile';
import { useSetFavoriteExercise } from '~/hooks/useExercises';
import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import type { Exercise } from '~/types/exercise';

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export function ExerciseTable({
  data,
  onAdd,
  onEdit,
  onDelete,
}: {
  data: Exercise[];
  onAdd: () => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const setFavoriteMutation = useSetFavoriteExercise();

  const columns: ColumnDef<Exercise>[] = React.useMemo(
    () => [
      {
        id: 'index',
        header: () => <div className="pl-4">№</div>,
        cell: ({ row }) => {
          return <div className="pl-4">{row.index + 1}</div>;
        },
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => {
          return <ExerciseCellViewer exercise={row.original} />;
        },
        enableHiding: false,
      },
      {
        accessorKey: 'author',
        header: 'Author',
      },
      {
        accessorKey: 'estimated_time',
        header: 'Estimated Time',
        cell: ({ row }) => {
          return formatDuration(row.original.estimated_time);
        },
      },
      {
        accessorKey: 'favorite',
        header: 'Favorite',
        cell: ({ row }) => {
          const handleFavoriteClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            setFavoriteMutation.mutate({
              exerciseId: row.original.id,
              isFavorite: !row.original.favorite,
            });
          };

          return row.original.favorite ? (
            <IconStarFilled
              onClick={handleFavoriteClick}
              className="size-4 fill-yellow-500 text-yellow-500 cursor-pointer"
            />
          ) : (
            <IconStar
              onClick={handleFavoriteClick}
              className="size-4 text-muted-foreground cursor-pointer"
            />
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => {
          const description = row.original.description || '-';
          return (
            <div className="max-w-md truncate" title={description}>
              {description}
            </div>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created At',
        cell: ({ row }) => {
          return formatDate(row.original.created_at);
        },
      },
      {
        accessorKey: 'lastSession',
        header: 'Last Session',
        cell: ({ row }) => {
          const lastSession = row.original.lastSession;
          if (!lastSession) return '-';
          return formatDate(lastSession.created_at);
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row.original)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete, setFavoriteMutation],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    getRowId: (row) => row.id,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="w-full flex-col justify-start gap-6 overflow-auto">
      <div className="flex items-center justify-between px-4 lg:px-6 mb-4">
        <div></div>
        <Button variant="outline" size="sm" onClick={onAdd}>
          <IconPlus />
          <span className="hidden lg:inline">Додати вправу</span>
          <span className="lg:hidden">Додати</span>
        </Button>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

function ExerciseCellViewer({ exercise }: { exercise: Exercise }) {
  const isMobile = useIsMobile();

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left cursor-pointer"
        >
          {exercise.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{exercise.name}</DrawerTitle>
          <DrawerDescription>Детальна інформація про вправу</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Автор
              </Label>
              <div className="text-sm">{exercise.author || '-'}</div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Оціночний час
              </Label>
              <div className="text-sm">
                {formatDuration(exercise.estimated_time)}
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Опис
              </Label>
              <div className="text-sm">
                {exercise.description || 'Опис відсутній'}
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Дата створення
              </Label>
              <div className="text-sm">{formatDate(exercise.created_at)}</div>
            </div>
            {exercise.lastSession && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs font-medium">
                    Остання сесія
                  </Label>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm">
                      Дата: {formatDate(exercise.lastSession.created_at)}
                    </div>
                    <div className="text-sm">
                      Тривалість:{' '}
                      {formatDuration(exercise.lastSession.duration_seconds)}
                    </div>
                  </div>
                </div>
              </>
            )}
            <Separator />
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Статус
              </Label>
              <div className="flex items-center gap-2">
                {exercise.favorite ? (
                  <>
                    <IconStarFilled className="size-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm">В обраному</span>
                  </>
                ) : (
                  <span className="text-sm">Не в обраному</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Закрити</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
