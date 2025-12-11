import { useRef, useState } from 'react'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { DocumentIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useNotes, useCreateNote, useDeleteNote } from '~/hooks/useNotes'
import type { Note } from '~/types/exercise'

interface SliderNotesProps {
  exerciseId?: string | null
}

function SliderNotes({ exerciseId = null }: SliderNotesProps) {
  const sliderRef = useRef<Slider>(null)
  const { data: notes = [], isLoading } = useNotes(exerciseId)
  const createNoteMutation = useCreateNote()
  const deleteNoteMutation = useDeleteNote(exerciseId)
  const [noteContent, setNoteContent] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)

  const next = () => {
    sliderRef.current?.slickNext()
  }

  const previous = () => {
    sliderRef.current?.slickPrev()
  }

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return

    try {
      await createNoteMutation.mutateAsync({
        content: noteContent.trim(),
        exercise_id: exerciseId,
      })
      setNoteContent('')
      // Перейти к первому слайду с заметками после сохранения
      if (notes.length > 0) {
        setTimeout(() => {
          sliderRef.current?.slickGoTo(1)
        }, 100)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Ви впевнені, що хочете видалити цю нотатку?')) return

    try {
      await deleteNoteMutation.mutateAsync(noteId)
      // Якщо видаляємо останню нотатку, перейти на перший слайд
      if (notes.length === 1) {
        setTimeout(() => {
          sliderRef.current?.slickGoTo(0)
        }, 100)
      } else if (currentSlide > 0 && currentSlide >= notes.length) {
        // Якщо видаляємо останню нотатку в списку, перейти на попередню
        setTimeout(() => {
          sliderRef.current?.slickGoTo(currentSlide - 1)
        }, 100)
      }
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (current: number, next: number) => {
      setCurrentSlide(next)
    },
  }

  // Первый слайд - форма для ввода, остальные - существующие заметки
  const totalSlides = 1 + notes.length

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Сьогодні'
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчора'
    }
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="slider-container mt-8">
      <div className="border-t border-gray-600/30 mb-4"></div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-300 text-sm font-bold tracking-wider">
          Нотатки
        </h2>
        <div className="flex items-center gap-2 flex-1 justify-center">
          {notes.length === 0 ? (
            <span className="text-gray-400 text-sm">нотаток немає</span>
          ) : (
            notes.map((_, index) => {
              // currentSlide 0 is the input form, so note index is currentSlide - 1
              const isActive = currentSlide === index + 1
              return (
                <DocumentIcon
                  key={index}
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-gray-500'
                  }`}
                />
              )
            })
          )}
        </div>
        {totalSlides > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="bg-gray-800/50 rounded-lg p-2 hover:bg-gray-800/70 transition-colors cursor-pointer"
              onClick={previous}
            >
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              className="bg-gray-800/50 rounded-lg p-2 hover:bg-gray-800/70 transition-colors cursor-pointer"
              onClick={next}
            >
              <svg
                className="w-4 h-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600/30 mb-4"></div>

      {isLoading ? (
        <div className="text-gray-300 text-center py-8">Завантаження...</div>
      ) : (
        <Slider ref={sliderRef} {...settings}>
          {/* First slide - Note input form */}
          <div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Введіть вашу нотатку..."
                className="w-full bg-gray-700/50 text-gray-300 rounded-lg p-4 border border-gray-600/50 focus:border-gray-500 focus:outline-none resize-none min-h-[120px] placeholder-gray-500"
                rows={5}
              />
              <button
                onClick={handleSaveNote}
                disabled={!noteContent.trim() || createNoteMutation.isPending}
                className="mt-4 w-full bg-green-700 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg py-2 px-4 transition-colors font-medium"
              >
                {createNoteMutation.isPending ? 'Збереження...' : 'Зберегти'}
              </button>
            </div>
          </div>

          {/* Existing notes slides */}
          {notes.length === 0 ? (
            <div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-400 text-center py-8">
                  Поки що немає нотаток
                </p>
              </div>
            </div>
          ) : (
            notes.map((note: Note) => (
              <div key={note.id}>
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-xs text-gray-500">
                      {formatDate(note.created_at)}
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      disabled={deleteNoteMutation.isPending}
                      className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Видалити нотатку"
                    >
                      <TrashIcon className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                  <div className="text-gray-300 whitespace-pre-wrap break-words">
                    {note.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </Slider>
      )}
    </div>
  )
}

export default SliderNotes