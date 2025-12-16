import { useContext, useState } from 'react';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useModal } from '~/hooks/useModal';
import { useCreatePlaylist } from '~/hooks/useExercises';
import { useExercises } from '~/hooks/useExercises';
import Devider from './Devider';
import type { Exercise } from '~/types/exercise';

const PlaylistSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Назва занадто коротка!')
    .max(160, 'Назва занадто довга!')
    .required("Обов'язкове поле"),
});

interface ExerciseItemProps {
  exercise: Exercise;
  onDragStart: (exercise: Exercise) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

function ExerciseItem({
  exercise,
  onDragStart,
  onDragEnd,
  isDragging,
}: ExerciseItemProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(exercise)}
      onDragEnd={onDragEnd}
      className={`p-3 mb-2 rounded-md bg-gray-700/50 border border-white/10 cursor-move hover:bg-gray-700 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="text-sm font-medium text-white">{exercise.name}</div>
      {exercise.description && (
        <div className="text-xs text-gray-400 mt-1">{exercise.description}</div>
      )}
    </div>
  );
}

function CreatePlaylist() {
  const { user } = useContext(SupabaseAuthContext);
  const { closeAllModals } = useModal();
  const createPlaylistMutation = useCreatePlaylist();
  const { data: exercises = [], isLoading } = useExercises();

  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [draggedExercise, setDraggedExercise] = useState<Exercise | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<
    'available' | 'selected' | null
  >(null);

  const handleDragStart = (exercise: Exercise) => {
    setDraggedExercise(exercise);
  };

  const handleDragEnd = () => {
    setDraggedExercise(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    column: 'available' | 'selected',
  ) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = (
    e: React.DragEvent,
    targetColumn: 'available' | 'selected',
  ) => {
    e.preventDefault();

    if (!draggedExercise) return;

    if (targetColumn === 'selected') {
      // Добавляем упражнение в выбранные, если его там еще нет
      if (!selectedExercises.find((ex) => ex.id === draggedExercise.id)) {
        setSelectedExercises([...selectedExercises, draggedExercise]);
      }
    } else {
      // Удаляем упражнение из выбранных
      setSelectedExercises(
        selectedExercises.filter((ex) => ex.id !== draggedExercise.id),
      );
    }

    setDraggedExercise(null);
    setDragOverColumn(null);
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
                  <input
                    type="text"
                    name="name"
                    placeholder="Назва плейлисту"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                    className="block w-full rounded-md px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6 bg-gray-700/50 border border-white/10"
                  />
                  {errors.name && touched.name ? (
                    <div className="ml-1 text-sm text-red-600">
                      {errors.name}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="italic text-sm text-gray-500 text-center">
                Перетягніть вправи зліва направо, щоб додати їх до плейлисту
              </div>

              <Devider />

              <div className="grid grid-cols-2 gap-4 min-h-[400px]">
                {/* Доступні вправи */}
                <div
                  className={`border-2 rounded-lg p-4 ${
                    dragOverColumn === 'available'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-white/10 bg-gray-800/30'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'available')}
                  onDrop={(e) => handleDrop(e, 'available')}
                  onDragLeave={() => setDragOverColumn(null)}
                >
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Доступні вправи ({availableExercises.length})
                  </h3>
                  <div className="overflow-y-auto max-h-[350px]">
                    {isLoading ? (
                      <div className="text-gray-400 text-sm">
                        Завантаження...
                      </div>
                    ) : availableExercises.length === 0 ? (
                      <div className="text-gray-400 text-sm italic">
                        Немає доступних вправ
                      </div>
                    ) : (
                      availableExercises.map((exercise) => (
                        <ExerciseItem
                          key={exercise.id}
                          exercise={exercise}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedExercise?.id === exercise.id}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Вибрані вправи */}
                <div
                  className={`border-2 rounded-lg p-4 ${
                    dragOverColumn === 'selected'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-white/10 bg-gray-800/30'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'selected')}
                  onDrop={(e) => handleDrop(e, 'selected')}
                  onDragLeave={() => setDragOverColumn(null)}
                >
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Вибрані вправи ({selectedExercises.length})
                  </h3>
                  <div className="overflow-y-auto max-h-[350px]">
                    {selectedExercises.length === 0 ? (
                      <div className="text-gray-400 text-sm italic">
                        Перетягніть вправи сюди
                      </div>
                    ) : (
                      selectedExercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-3 mb-2 rounded-md bg-gray-700/50 border border-white/10 flex items-center justify-between group"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {exercise.name}
                            </div>
                            {exercise.description && (
                              <div className="text-xs text-gray-400 mt-1">
                                {exercise.description}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromSelected(exercise.id)}
                            className="ml-2 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Видалити"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <Devider />

              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="inline-flex w-full justify-center rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createPlaylistMutation.isPending ||
                    !(dirty && isValid) ||
                    selectedExercises.length === 0
                  }
                  className="inline-flex w-full justify-center rounded-md disabled:hover:bg-green-600 disabled:opacity-50 bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 cursor-pointer"
                >
                  {isSubmitting || createPlaylistMutation.isPending
                    ? 'Зберігаємо...'
                    : 'Зберегти'}
                </button>
              </div>
            </form>
          );
        }}
      </Formik>
    </div>
  );
}

export default CreatePlaylist;
