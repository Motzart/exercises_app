import { useContext, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from '@dnd-kit/core';
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useModal } from '~/hooks/useModal';
import { useCreatePlaylist } from '~/hooks/useExercises';
import { useExercises } from '~/hooks/useExercises';
import Devider from './Devider';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X } from 'lucide-react';
import { cn } from '~/lib/utils';
import type { Exercise } from '~/types/exercise';

const PlaylistSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Назва занадто коротка!')
    .max(160, 'Назва занадто довга!')
    .required("Обов'язкове поле"),
});

interface ExerciseItemProps {
  exercise: Exercise;
  isDragging: boolean;
}

function ExerciseItem({ exercise, isDragging }: ExerciseItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `exercise-${exercise.id}`,
    data: {
      type: 'exercise',
      exercise,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none',
      }}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 mb-2 rounded-md bg-card border border-border cursor-grab active:cursor-grabbing hover:bg-accent transition-colors select-none',
        isDragging && 'opacity-40',
      )}
    >
      <div className="text-sm font-medium">{exercise.name}</div>
      {exercise.description && (
        <div className="text-xs text-muted-foreground mt-1">
          {exercise.description}
        </div>
      )}
    </div>
  );
}

interface SelectedExerciseItemProps {
  exercise: Exercise;
  isDragging: boolean;
  onRemove: (exerciseId: string) => void;
}

function SelectedExerciseItem({
  exercise,
  isDragging,
  onRemove,
}: SelectedExerciseItemProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `exercise-${exercise.id}`,
    data: {
      type: 'exercise',
      exercise,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        touchAction: 'none',
      }}
      {...listeners}
      {...attributes}
      className={cn(
        'p-3 mb-2 rounded-md bg-card border border-border flex items-center justify-between group cursor-grab active:cursor-grabbing hover:bg-accent transition-colors select-none',
        isDragging && 'opacity-40',
      )}
    >
      <div className="flex-1">
        <div className="text-sm font-medium">{exercise.name}</div>
        {exercise.description && (
          <div className="text-xs text-muted-foreground mt-1">
            {exercise.description}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(exercise.id);
        }}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
        aria-label="Видалити"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface DroppableColumnProps {
  id: string;
  children: React.ReactNode;
  isOver: boolean;
  title: string;
  count: number;
}

function DroppableColumn({
  id,
  children,
  isOver,
  title,
  count,
}: DroppableColumnProps) {
  const { setNodeRef, isOver: isOverState } = useDroppable({
    id,
    data: {
      type: 'column',
      accepts: ['exercise'],
    },
  });

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'min-h-[400px] flex flex-col',
        (isOver || isOverState) && 'ring-2 ring-primary ring-offset-2',
      )}
    >
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold mb-3">
          {title} ({count})
        </h3>
        <div
          className="overflow-y-auto max-h-[350px] flex-1"
          style={{ touchAction: 'pan-y' }}
        >
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

function CreatePlaylist() {
  const { user } = useContext(SupabaseAuthContext);
  const { closeAllModals } = useModal();
  const createPlaylistMutation = useCreatePlaylist();
  const { data: exercises = [], isLoading } = useExercises();

  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);

    if (id.startsWith('exercise-')) {
      const exerciseId = id.replace('exercise-', '');
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      setActiveExercise(exercise || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as string | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setOverId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('exercise-')) {
      const exerciseId = activeId.replace('exercise-', '');
      const exercise = exercises.find((ex) => ex.id === exerciseId);

      if (!exercise) {
        setActiveId(null);
        setOverId(null);
        return;
      }

      if (overId === 'column-selected') {
        // Добавляем упражнение в выбранные, если его там еще нет
        if (!selectedExercises.find((ex) => ex.id === exercise.id)) {
          setSelectedExercises([...selectedExercises, exercise]);
        }
      } else if (overId === 'column-available') {
        // Удаляем упражнение из выбранных
        setSelectedExercises(
          selectedExercises.filter((ex) => ex.id !== exercise.id),
        );
      }
    }

    setActiveId(null);
    setOverId(null);
    setActiveExercise(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
    setActiveExercise(null);
  };

  const removeFromSelected = (exerciseId: string) => {
    setSelectedExercises(
      selectedExercises.filter((ex) => ex.id !== exerciseId),
    );
  };

  const availableExercises = exercises.filter(
    (ex) => !selectedExercises.find((selected) => selected.id === ex.id),
  );

  const handleSubmit = async (values: { name: string }) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    if (selectedExercises.length === 0) {
      alert('Будь ласка, додайте хоча б одне вправу до плейлисту');
      return;
    }

    try {
      await createPlaylistMutation.mutateAsync({
        name: values.name,
        exercise_ids: selectedExercises.map((ex) => ex.id),
      });
      closeAllModals();
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-5">Створити новий плейлист</h2>
      <Formik
        initialValues={{ name: '' }}
        validationSchema={PlaylistSchema}
        onSubmit={handleSubmit}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          isValid,
          dirty,
        }) => {
          return (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="mt-2">
                  <Input
                    type="text"
                    name="name"
                    placeholder="Назва плейлисту"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                  />
                  {errors.name && touched.name ? (
                    <div className="ml-1 mt-1 text-sm text-destructive">
                      {errors.name}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="italic text-sm text-muted-foreground text-center">
                Перетягніть вправи зліва направо, щоб додати їх до плейлисту
              </div>

              <Devider />

              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <div className="grid grid-cols-2 gap-4">
                  {/* Доступні вправи */}
                  <DroppableColumn
                    id="column-available"
                    title="Доступні вправи"
                    count={availableExercises.length}
                    isOver={overId === 'column-available'}
                  >
                    {isLoading ? (
                      <div className="text-muted-foreground text-sm">
                        Завантаження...
                      </div>
                    ) : availableExercises.length === 0 ? (
                      <div className="text-muted-foreground text-sm italic">
                        Немає доступних вправ
                      </div>
                    ) : (
                      availableExercises.map((exercise) => (
                        <ExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          isDragging={activeId === `exercise-${exercise.id}`}
                        />
                      ))
                    )}
                  </DroppableColumn>

                  {/* Вибрані вправи */}
                  <DroppableColumn
                    id="column-selected"
                    title="Вибрані вправи"
                    count={selectedExercises.length}
                    isOver={overId === 'column-selected'}
                  >
                    {selectedExercises.length === 0 ? (
                      <div className="text-muted-foreground text-sm italic">
                        Перетягніть вправи сюди
                      </div>
                    ) : (
                      selectedExercises.map((exercise) => (
                        <SelectedExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          isDragging={activeId === `exercise-${exercise.id}`}
                          onRemove={removeFromSelected}
                        />
                      ))
                    )}
                  </DroppableColumn>
                </div>

                <DragOverlay>
                  {activeExercise ? (
                    <div className="p-3 rounded-md bg-card border border-border shadow-lg rotate-2">
                      <div className="text-sm font-medium">
                        {activeExercise.name}
                      </div>
                      {activeExercise.description && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {activeExercise.description}
                        </div>
                      )}
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>

              <Devider />

              <div className="flex flex-row gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAllModals}
                >
                  Скасувати
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createPlaylistMutation.isPending ||
                    !(dirty && isValid) ||
                    selectedExercises.length === 0
                  }
                >
                  {isSubmitting || createPlaylistMutation.isPending
                    ? 'Зберігаємо...'
                    : 'Зберегти'}
                </Button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}

export default CreatePlaylist;
