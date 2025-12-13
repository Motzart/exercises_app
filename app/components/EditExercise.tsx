import { Formik } from 'formik'
import Devider from './Devider'

import * as Yup from 'yup'
import { useModal } from '~/hooks/useModal'
import { useUpdateExercise } from '~/hooks/useExercises'
import type { Exercise } from '~/types/exercise'

const ExerciseSchema = Yup.object().shape({
  name: Yup.string()
    .min(4, 'description is too short!')
    .max(160, 'description is too long!')
    .required('required'),
})

function EditExercise({ exercise }: { exercise: Exercise }) {
  const { closeAllModals } = useModal()
  const updateExerciseMutation = useUpdateExercise()

  const handleSubmitButton = async (values: any) => {
    try {
      await updateExerciseMutation.mutateAsync({
        exerciseId: exercise.id,
        updates: {
          name: values.name,
        },
      })
      closeAllModals()
    } catch (error) {
      console.error('Error updating exercise:', error)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-5">Редагувати вправу</h2>
      <Formik
        initialValues={{ name: exercise.name }}
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
                <div className="mt-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.name}
                    className="block w-full rounded-md px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  />
                  {errors.name && touched.name ? (
                    <div className="ml-1 text-sm text-red-600">
                      {errors.name}
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="italic text-sm text-gray-500 text-center">
                Напишіть назву для цієї вправи
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
          )
        }}
      </Formik>
    </div>
  )
}

export default EditExercise
