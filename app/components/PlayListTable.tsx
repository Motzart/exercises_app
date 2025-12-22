import * as React from 'react';
import { IconDotsVertical, IconPlus } from '@tabler/icons-react';
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
import { useExercises } from '~/hooks/useExercises';
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
import type { PlaylistWithCount } from '~/services/superbaseDb';

function formatDate(dateString?: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
}

export function PlayListTable({
  data,
  onAdd,
  onEdit,
  onDelete,
}: {
  data: PlaylistWithCount[];
  onAdd: () => void;
  onEdit: (playlistId: string) => void;
  onDelete: (playlistId: string) => void;
}) {
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const { data: exercises = [] } = useExercises();

  // Create a map for quick access to exercise names
  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, string>();
    exercises.forEach((exercise) => {
      map.set(exercise.id, exercise.name);
    });
    return map;
  }, [exercises]);

  const columns: ColumnDef<PlaylistWithCount>[] = React.useMemo(
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
          return <PlayListCellViewer playlist={row.original} />;
        },
        enableHiding: false,
      },
      {
        accessorKey: 'exercise_count',
        header: 'Exercise Count',
        cell: ({ row }) => {
          const count = row.original.exercise_count || 0;
          return (
            <div>
              {count} {count === 1 ? 'вправа' : 'вправ'}
            </div>
          );
        },
      },
      {
        id: 'exercises',
        header: 'Вправи',
        cell: ({ row }) => {
          const exerciseIds = row.original.exercise_ids || [];
          if (exerciseIds.length === 0) {
            return <div className="text-muted-foreground">-</div>;
          }
          const exerciseNames = exerciseIds
            .map((id) => exerciseMap.get(id))
            .filter((name): name is string => name !== undefined);

          if (exerciseNames.length === 0) {
            return <div className="text-muted-foreground">-</div>;
          }

          return (
            <div className="max-w-md truncate" title={exerciseNames.join(', ')}>
              {exerciseNames.join(', ')}
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
              <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(row.original.id)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [onEdit, onDelete, exerciseMap],
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
          <span className="hidden lg:inline">Додати плейлист</span>
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

function PlayListCellViewer({ playlist }: { playlist: PlaylistWithCount }) {
  const isMobile = useIsMobile();
  const { data: exercises = [] } = useExercises();

  // Create a map for quick access to exercise names
  const exerciseMap = React.useMemo(() => {
    const map = new Map<string, string>();
    exercises.forEach((exercise) => {
      map.set(exercise.id, exercise.name);
    });
    return map;
  }, [exercises]);

  const exerciseNames = React.useMemo(() => {
    const ids = playlist.exercise_ids || [];
    return ids
      .map((id) => exerciseMap.get(id))
      .filter((name): name is string => name !== undefined);
  }, [playlist.exercise_ids, exerciseMap]);

  return (
    <Drawer direction={isMobile ? 'bottom' : 'right'}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          className="text-foreground w-fit px-0 text-left cursor-pointer"
        >
          {playlist.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{playlist.name}</DrawerTitle>
          <DrawerDescription>
            Детальна інформація про плейлист
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Кількість вправ
              </Label>
              <div className="text-sm">
                {playlist.exercise_count || 0}{' '}
                {playlist.exercise_count === 1 ? 'вправа' : 'вправ'}
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs font-medium">
                Дата створення
              </Label>
              <div className="text-sm">{formatDate(playlist.created_at)}</div>
            </div>
            {exerciseNames.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <Label className="text-muted-foreground text-xs font-medium">
                    Вправи
                  </Label>
                  <div className="flex flex-col gap-1">
                    {exerciseNames.map((name, index) => (
                      <div key={index} className="text-sm">
                        • {name}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
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
