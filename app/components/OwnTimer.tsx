import { CheckIcon, PauseIcon, PlayPauseIcon } from '@heroicons/react/16/solid';
import { IconNotebook } from '@tabler/icons-react';
import { useContext, useEffect, useRef, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import type { CreateSessionInput, Exercise } from '~/types/exercise';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useCreateSession } from '~/hooks/useSession';
import { useNotes, useCreateNote } from '~/hooks/useNotes';
import { useIsMobile } from '~/hooks/use-mobile';
import SliderNotes from './SliderNotes';
import { Button } from './ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './ui/drawer';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { cn } from '~/lib/utils';

const OwnTimer = ({
  onClose,
  exercise,
}: {
  onClose: () => void;
  exercise: Exercise | null;
}) => {
  const { user } = useContext(SupabaseAuthContext);
  const createSessionMutation = useCreateSession();
  const [session, setSession] = useState<CreateSessionInput | null>(null);
  const [newNoteContent, setNewNoteContent] = useState('');
  const startTimeRef = useRef<Date | null>(null);
  const { data: notes = [] } = useNotes(exercise?.id);
  const createNoteMutation = useCreateNote();
  const isMobile = useIsMobile();

  const { totalSeconds, isRunning, start, pause } = useStopwatch({
    autoStart: false,
    interval: 20,
  });

  useEffect(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
  }, []);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  const handlePause = () => {
    pause();
  };

  const handleStart = () => {
    start();
  };

  const handleStop = async () => {
    if (!exercise || !user?.id || !startTimeRef.current) {
      onClose();
      return;
    }

    const startAt = startTimeRef.current;
    const endAt = new Date();

    const sessionData: CreateSessionInput = {
      exercise_id: exercise.id,
      started_at: startAt.toISOString(),
      ended_at: endAt.toISOString(),
      duration_seconds: totalSeconds,
    };

    try {
      await createSessionMutation.mutateAsync(sessionData);
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to create session:', error);
    }

    onClose();
  };

  const displayHours = Math.floor(totalSeconds / 3600);
  const displayMinutes = Math.floor((totalSeconds % 3600) / 60);
  const displaySeconds = totalSeconds % 60;

  // Progress bar configuration: 15 minutes = 900 seconds, 3 segments of 5 minutes each
  const TOTAL_DURATION_SECONDS = 15 * 60; // 900 seconds
  const SEGMENT_DURATION_SECONDS = 5 * 60; // 300 seconds per segment

  // Calculate which segment we're in and how much of it is filled
  const currentSegment = Math.min(
    Math.floor(totalSeconds / SEGMENT_DURATION_SECONDS),
    2,
  );
  const segmentProgress =
    currentSegment < 3
      ? ((totalSeconds % SEGMENT_DURATION_SECONDS) / SEGMENT_DURATION_SECONDS) *
        100
      : 100;

  const segmentColors = [
    'bg-red-500', // 0-5 minutes: red
    'bg-yellow-500', // 5-10 minutes: yellow
    'bg-green-500', // 10-15 minutes: green
  ];

  const timeMarkers = ['5хв', '10хв', '15хв'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сьогодні';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Вчора';
    }
    return date.toLocaleDateString('uk-UA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatNoteTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Sort notes by date (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleSaveNote = async () => {
    if (!newNoteContent.trim() || !exercise?.id) return;

    try {
      await createNoteMutation.mutateAsync({
        content: newNoteContent.trim(),
        exercise_id: exercise.id,
      });
      setNewNoteContent('');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full pb-20 sm:pb-0">
      {/* Main Content Area */}
      <div className="w-full text-center text-xs sm:text-sm text-muted-foreground font-medium px-2 sm:px-0">
        {exercise?.description}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 gap-6 sm:gap-8 md:gap-12">
        {/* Timer Display - Large and Centered */}
        <div className="flex flex-col items-center gap-3 sm:gap-4 md:gap-6">
          <div className="relative">
            <div
              className={cn(
                'text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[12rem] font-mono font-bold tracking-tight transition-all duration-500',
                'text-sky-400',
                !isRunning && 'opacity-50',
              )}
            >
              <span className="tabular-nums">
                {formatTime(displayHours)}:{formatTime(displayMinutes)}:
                {formatTime(displaySeconds)}
              </span>
            </div>

            {/* Pause Badge */}
            {!isRunning && totalSeconds > 0 && (
              <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2">
                <div className="bg-muted px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Пауза
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Time Label */}
          <div className="text-xs sm:text-sm text-muted-foreground font-medium">
            {displayHours}h {displayMinutes}m {displaySeconds}s
          </div>
        </div>

        {/* Control Buttons - Horizontal Layout */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full max-w-md px-2 sm:px-0">
          <Button
            variant={isRunning ? 'outline' : 'default'}
            size={isMobile ? 'default' : 'lg'}
            onClick={() => (isRunning ? handlePause() : handleStart())}
            className={cn(
              'flex-1 h-12 sm:h-14 md:h-16 text-sm sm:text-base font-semibold gap-1.5 sm:gap-2',
              isRunning && 'border-2',
            )}
          >
            {isRunning ? (
              <>
                <PauseIcon className="size-4 sm:size-5" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <PlayPauseIcon className="size-4 sm:size-5" />
                <span>Старт</span>
              </>
            )}
          </Button>

          <Button
            variant="default"
            size={isMobile ? 'default' : 'lg'}
            onClick={handleStop}
            disabled={createSessionMutation.isPending || totalSeconds === 0}
            className="flex-1 h-12 sm:h-14 md:h-16 bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base font-semibold gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="size-4 sm:size-5" />
            <span className="hidden sm:inline">
              {createSessionMutation.isPending ? 'Збереження...' : 'Завершити'}
            </span>
            <span className="sm:hidden">
              {createSessionMutation.isPending ? '...' : 'Готово'}
            </span>
          </Button>

          <Drawer direction={isMobile ? 'bottom' : 'right'}>
            <DrawerTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-2 cursor-pointer shrink-0"
                type="button"
              >
                <IconNotebook className="size-4 sm:size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader className="gap-1 px-4 sm:px-6">
                <DrawerTitle className="text-lg sm:text-xl">Нотатки</DrawerTitle>
              </DrawerHeader>
              <div className="flex flex-col gap-4 overflow-y-auto px-4 sm:px-6 text-sm">
                {sortedNotes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Поки що немає нотаток
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sortedNotes.map((note, index) => (
                      <div key={note.id}>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-muted-foreground text-xs font-medium">
                              {formatDate(note.created_at)} о {formatNoteTime(note.created_at)}
                            </Label>
                          </div>
                          <div className="text-sm whitespace-pre-wrap wrap-break-word">
                            {note.content}
                          </div>
                        </div>
                        {index < sortedNotes.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DrawerFooter className="gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="flex flex-col gap-2 w-full">
                  <Label className="text-sm font-medium">Додати нотатку</Label>
                  <Textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Введіть вашу нотатку..."
                    className="min-h-[80px] sm:min-h-[100px] resize-none"
                    rows={isMobile ? 3 : 4}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSaveNote}
                      disabled={!newNoteContent.trim() || createNoteMutation.isPending}
                      className="flex-1"
                    >
                      {createNoteMutation.isPending ? 'Збереження...' : 'Зберегти'}
                    </Button>
                    <DrawerClose asChild>
                      <Button variant="outline">Закрити</Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      {/* Notes Section */}
      {/* <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <SliderNotes exerciseId={exercise?.id || null} />
      </div> */}

      {/* Progress Bar - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex h-1 sm:h-1.5 w-full relative overflow-hidden">
          {[0, 1, 2].map((segmentIndex) => {
            const isCompleted = segmentIndex < currentSegment;
            const isCurrent = segmentIndex === currentSegment;
            const segmentFillPercent = isCompleted
              ? 100
              : isCurrent
                ? segmentProgress
                : 0;

            return (
              <div
                key={segmentIndex}
                className="relative bg-muted/20"
                style={{ width: '33.33%' }}
              >
                <div
                  className={cn(
                    segmentColors[segmentIndex],
                    'h-full transition-all duration-300 ease-linear shadow-sm',
                  )}
                  style={{
                    width: `${segmentFillPercent}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* Time Markers */}
        <div className="flex w-full bg-muted/10 py-2 sm:py-2.5 px-2 sm:px-4 border-t border-border/50">
          {timeMarkers.map((marker, index) => {
            const isActive = index <= currentSegment;
            return (
              <div
                key={index}
                className={cn(
                  'flex-1 text-center text-[10px] sm:text-xs font-medium transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground',
                )}
                style={{ width: '33.33%' }}
              >
                {marker}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OwnTimer;
