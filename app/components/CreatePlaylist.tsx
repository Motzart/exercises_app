import { useContext, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useModal } from '~/hooks/useModal';
import { useCreatePlaylist } from '~/hooks/useExercises';
import { useExercises } from '~/hooks/useExercises';
import Devider from './Devider';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Minus, Plus } from 'lucide-react';
import type { Exercise } from '~/types/exercise';

const PlaylistSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Назва занадто коротка!')
    .max(160, 'Назва занадто довга!')
    .required("Обов'язкове поле"),
});

interface ExerciseItemProps {
  exercise: Exercise;
  onAdd: (exercise: Exercise) => void;
}

function ExerciseItem({ exercise, onAdd }: ExerciseItemProps) {
  return (
    <div className="p-3 mb-2 rounded-md bg-card border border-border flex items-center justify-between gap-2 hover:bg-accent transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{exercise.name}</div>
        {exercise.description && (
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {exercise.description}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onAdd(exercise)}
        className="shrink-0 text-primary hover:text-primary hover:bg-primary/10"
        aria-label="Додати до плейлисту"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface SelectedExerciseItemProps {
  exercise: Exercise;
  onRemove: (exerciseId: string) => void;
}

function SelectedExerciseItem({
  exercise,
  onRemove,
}: SelectedExerciseItemProps) {
  return (
    <div className="p-3 mb-2 rounded-md bg-card border border-border flex items-center justify-between gap-2 hover:bg-accent transition-colors">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{exercise.name}</div>
        {exercise.description && (
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {exercise.description}
          </div>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(exercise.id)}
        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        aria-label="Прибрати з плейлисту"
      >
        <Minus className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface ColumnProps {
  children: React.ReactNode;
  title: string;
  count: number;
}

function Column({ children, title, count }: ColumnProps) {
  return (
    <Card className="min-h-[400px] flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-semibold mb-3">
          {title} ({count})
        </h3>
        <div className="overflow-y-auto max-h-[350px] flex-1">
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

  const addToPlaylist = (exercise: Exercise) => {
    if (selectedExercises.some((ex) => ex.id === exercise.id)) return;
    setSelectedExercises([...selectedExercises, exercise]);
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
                Натисніть + біля вправи, щоб додати її до плейлисту; − щоб прибрати
              </div>

              <Devider />

              <div className="grid grid-cols-2 gap-4">
                <Column
                  title="Доступні вправи"
                  count={availableExercises.length}
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
                        onAdd={addToPlaylist}
                      />
                    ))
                  )}
                </Column>

                <Column
                  title="Вибрані вправи"
                  count={selectedExercises.length}
                >
                  {selectedExercises.length === 0 ? (
                    <div className="text-muted-foreground text-sm italic">
                      Додайте вправи кнопкою +
                    </div>
                  ) : (
                    selectedExercises.map((exercise) => (
                      <SelectedExerciseItem
                        key={exercise.id}
                        exercise={exercise}
                        onRemove={removeFromSelected}
                      />
                    ))
                  )}
                </Column>
              </div>

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
