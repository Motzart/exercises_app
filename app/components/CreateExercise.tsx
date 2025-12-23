import { Formik } from 'formik';
import * as Yup from 'yup';
import { useContext } from 'react';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useModal } from '~/hooks/useModal';
import { useCreateExercise } from '~/hooks/useExercises';
import type { CreateExerciseInput } from '~/types/exercise';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Separator } from './ui/separator';

const ExerciseSchema = Yup.object().shape({
  name: Yup.string()
    .min(1, "Назва обов'язкова!")
    .max(180, 'Назва занадто довга!')
    .required("Назва обов'язкова!"),
  author: Yup.string().max(180, 'Автор занадто довгий!'),
  description: Yup.string().max(180, 'Опис занадто довгий!'),
  estimated_time: Yup.string()
    .required("Час обов'язковий")
    .test('is-positive', "Час не може бути від'ємним", (value) => {
      if (!value) return false;
      const num = Number(value);
      return num >= 0;
    }),
});

const CreateExercise = () => {
  const { user } = useContext(SupabaseAuthContext);
  const { closeAllModals } = useModal();
  const createExerciseMutation = useCreateExercise();

  const handleSubmitButton = async (values: any) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    // Конвертуємо estimated_time з хвилин в секунди
    const estimatedTimeInMinutes = Number(values.estimated_time);
    const estimatedTimeInSeconds = estimatedTimeInMinutes * 60;

    const exercise: CreateExerciseInput = {
      name: values.name,
      author: values.author || '',
      description: values.description || '',
      estimated_time: estimatedTimeInSeconds,
      favorite: false,
      user_id: user.id,
    };

    try {
      await createExerciseMutation.mutateAsync(exercise);
      closeAllModals();
    } catch (error) {
      console.error('Error creating exercise:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-5">Створити нову вправу</h2>
      <Formik
        initialValues={{
          name: '',
          author: '',
          description: '',
          estimated_time: '5',
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
          setFieldValue,
          isSubmitting,
          isValid,
          dirty,
        }) => {
          return (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Назва <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Назва вправи"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  maxLength={180}
                  aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                />
                {errors.name && touched.name ? (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Автор</Label>
                <Input
                  id="author"
                  name="author"
                  type="text"
                  placeholder="Автор вправи"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.author}
                  maxLength={180}
                  aria-invalid={
                    errors.author && touched.author ? 'true' : 'false'
                  }
                />
                {errors.author && touched.author ? (
                  <p className="text-sm text-destructive mt-1">
                    {errors.author}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Опис вправи"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.description}
                  maxLength={180}
                  rows={3}
                  aria-invalid={
                    errors.description && touched.description ? 'true' : 'false'
                  }
                />
                {errors.description && touched.description ? (
                  <p className="text-sm text-destructive mt-1">
                    {errors.description}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_time">
                  Орієнтовний час <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={values.estimated_time}
                  onValueChange={(value) =>
                    setFieldValue('estimated_time', value)
                  }
                  name="estimated_time"
                >
                  <SelectTrigger
                    id="estimated_time"
                    className="w-full"
                    aria-invalid={
                      errors.estimated_time && touched.estimated_time
                        ? 'true'
                        : 'false'
                    }
                  >
                    <SelectValue placeholder="Оберіть час" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 25 }, (_, i) => (i + 1) * 5).map(
                      (minutes) => (
                        <SelectItem key={minutes} value={String(minutes)}>
                          {minutes} хвилин
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {errors.estimated_time && touched.estimated_time ? (
                  <p className="text-sm text-destructive mt-1">
                    {errors.estimated_time}
                  </p>
                ) : null}
              </div>

              <Separator />

              <div className="flex flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAllModals}
                  className="flex-1"
                >
                  Передумав
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={
                    isSubmitting ||
                    createExerciseMutation.isPending ||
                    !(dirty && isValid)
                  }
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting || createExerciseMutation.isPending
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
};

export default CreateExercise;
