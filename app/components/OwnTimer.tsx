import { CheckIcon, PauseIcon, PlayPauseIcon } from '@heroicons/react/16/solid';
import { useContext, useEffect, useRef, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import type { CreateSessionInput, Exercise } from '~/types/exercise';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useCreateSession } from '~/hooks/useSession';
import SliderNotes from './SliderNotes';
import { Button } from './ui/button';
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
  const startTimeRef = useRef<Date | null>(null);

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

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Content Area */}
      <div className="w-full text-center text-sm text-muted-foreground font-medium">
        {exercise?.description}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 gap-12">
        {/* Timer Display - Large and Centered */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div
              className={cn(
                'text-8xl sm:text-9xl lg:text-[12rem] font-mono font-bold tracking-tight transition-all duration-500',
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
              <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                <div className="bg-muted px-4 py-1.5 rounded-full border">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    Пауза
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Time Label */}
          <div className="text-sm text-muted-foreground font-medium">
            {displayHours}h {displayMinutes}m {displaySeconds}s
          </div>
        </div>

        {/* Control Buttons - Horizontal Layout */}
        <div className="flex items-center gap-3 sm:gap-4 w-full max-w-md">
          <Button
            variant={isRunning ? 'outline' : 'default'}
            size="lg"
            onClick={() => (isRunning ? handlePause() : handleStart())}
            className={cn(
              'flex-1 h-14 sm:h-16 text-base font-semibold gap-2',
              isRunning && 'border-2',
            )}
          >
            {isRunning ? (
              <>
                <PauseIcon className="size-5" />
                <span>Пауза</span>
              </>
            ) : (
              <>
                <PlayPauseIcon className="size-5" />
                <span>Старт</span>
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={handleStop}
            disabled={createSessionMutation.isPending || totalSeconds === 0}
            className="flex-1 h-14 sm:h-16 bg-green-600 hover:bg-green-700 text-white text-base font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckIcon className="size-5" />
            <span>
              {createSessionMutation.isPending ? 'Збереження...' : 'Завершити'}
            </span>
          </Button>
        </div>
      </div>

      {/* Notes Section */}
      {/* <div className="px-4 sm:px-6 lg:px-8 pb-24">
        <SliderNotes exerciseId={exercise?.id || null} />
      </div> */}

      {/* Progress Bar - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
        <div className="flex h-1.5 w-full relative overflow-hidden">
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
        <div className="flex w-full bg-muted/10 py-2.5 px-4 border-t border-border/50">
          {timeMarkers.map((marker, index) => {
            const isActive = index <= currentSegment;
            return (
              <div
                key={index}
                className={cn(
                  'flex-1 text-center text-xs font-medium transition-colors',
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
