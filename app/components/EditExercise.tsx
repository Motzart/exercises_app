import { Formik } from 'formik';
import Devider from './Devider';

import * as Yup from 'yup';
import { useModal } from '~/hooks/useModal';
import { useUpdateExercise } from '~/hooks/useExercises';
import type { Exercise } from '~/types/exercise';

const ExerciseSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Назва обов'язкова!")
    .max(180, 'Назва занадто довга!')
    .required("Назва обов'язкова!"),
  author: Yup.string().max(180, 'Автор занадто довгий!'),
  description: Yup.string().max(180, 'Опис занадто довгий!'),
  estimated_time: Yup.number()
    .min(0, "Час не може бути від'ємним")
    .required("Час обов'язковий"),
});

function EditExercise({ exercise }: { exercise: Exercise }) {
  const { closeAllModals } = useModal();
  const updateExerciseMutation = useUpdateExercise();

  const handleSubmitButton = async (values: any) => {
    // Конвертуємо estimated_time з хвилин в секунди
    const estimatedTimeInMinutes = Number(values.estimated_time);
    const estimatedTimeInSeconds = estimatedTimeInMinutes * 60;

    try {
      await updateExerciseMutation.mutateAsync({
        exerciseId: exercise.id,
        updates: {
          name: values.name,
          author: values.author || '',
          description: values.description || '',
          estimated_time: estimatedTimeInSeconds,
        },
      });
      closeAllModals();
    } catch (error) {
      console.error('Error updating exercise:', error);
    }
  };

  // Конвертуємо estimated_time з секунд в хвилини для форми
  const estimatedTimeInMinutes = Math.round(exercise.estimated_time / 60);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-5">Редагувати вправу</h2>
      <Formik
        initialValues={{
          name: exercise.name,
          author: exercise.author || '',
          description: exercise.description || '',
          estimated_time: estimatedTimeInMinutes || 5,
        }}
        validationSchema={ExerciseSchema}
        onSubmit={(values) => handleSubmitButton(values)}
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Назва <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Назва вправи"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                    maxLength={180}
                    className="block w-full rounded-md px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6 bg-gray-800"
                  />
                  {errors.name && touched.name ? (
                    <div className="ml-1 text-sm text-red-600 mt-1">
                      {errors.name}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Автор
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="author"
                    placeholder="Автор вправи"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.author}
                    maxLength={180}
                    className="block w-full rounded-md px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6 bg-gray-800"
                  />
                  {errors.author && touched.author ? (
                    <div className="ml-1 text-sm text-red-600 mt-1">
                      {errors.author}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Опис
                </label>
                <div className="mt-2">
                  <textarea
                    name="description"
                    placeholder="Опис вправи"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.description}
                    maxLength={180}
                    rows={3}
                    className="block w-full rounded-md px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6 bg-gray-800 resize-none"
                  />
                  {errors.description && touched.description ? (
                    <div className="ml-1 text-sm text-red-600 mt-1">
                      {errors.description}
                    </div>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Орієнтовний час <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    name="estimated_time"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.estimated_time}
                    className="block w-full rounded-md px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6 bg-gray-800"
                  >
                    {Array.from({ length: 25 }, (_, i) => (i + 1) * 5).map(
                      (minutes) => (
                        <option key={minutes} value={minutes}>
                          {minutes} хвилин
                        </option>
                      ),
                    )}
                  </select>
                  {errors.estimated_time && touched.estimated_time ? (
                    <div className="ml-1 text-sm text-red-600 mt-1">
                      {errors.estimated_time}
                    </div>
                  ) : null}
                </div>
              </div>

              <Devider />
              <div className="flex flex-row gap-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="nline-flex w-full justify-center rounded-md bg-transparent px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 cursor-pointer"
                >
                  Передумав
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    updateExerciseMutation.isPending ||
                    !(dirty && isValid)
                  }
                  className="nline-flex w-full justify-center rounded-md disabled:hover:bg-green-600 disabled:opacity-50 bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 cursor-pointer"
                >
                  {isSubmitting || updateExerciseMutation.isPending
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

export default EditExercise;
