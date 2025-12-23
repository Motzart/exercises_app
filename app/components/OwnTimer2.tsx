import { CheckIcon, PauseIcon, PlayPauseIcon } from '@heroicons/react/16/solid';
import { useContext, useEffect, useRef, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import type { CreateSessionInput, Exercise } from '~/types/exercise';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useCreateSession } from '~/hooks/useSession';
import { Button } from './ui/button';
import { cn } from '~/lib/utils';

const OwnTimer2 = ({
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

  // Progress configuration: 15 minutes = 900 seconds, 3 segments of 5 minutes each
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

  // Calculate overall progress percentage (0-100%)
  const overallProgress = Math.min(
    (totalSeconds / TOTAL_DURATION_SECONDS) * 100,
    100,
  );

  // Circle SVG configuration
  const CIRCLE_SIZE = 320;
  const CIRCLE_STROKE_WIDTH = 12;
  const CIRCLE_RADIUS = (CIRCLE_SIZE - CIRCLE_STROKE_WIDTH) / 2;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

  // Calculate stroke-dashoffset for the progress circle
  const progressOffset =
    CIRCLE_CIRCUMFERENCE - (overallProgress / 100) * CIRCLE_CIRCUMFERENCE;

  // Segment colors matching the original design
  const segmentColors = [
    '#ef4444', // red-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
  ];

  const getCurrentSegmentColor = () => {
    if (currentSegment >= 0 && currentSegment < segmentColors.length) {
      return segmentColors[currentSegment];
    }
    return segmentColors[2]; // default to green
  };

  const timeMarkers = ['5хв', '10хв', '15хв'];

  // Calculate positions for time markers on the circle
  const getMarkerPosition = (index: number) => {
    const angle =
      (index + 1) * (SEGMENT_DURATION_SECONDS / TOTAL_DURATION_SECONDS) * 360 -
      90; // Start from top
    const radian = (angle * Math.PI) / 180;
    const x = CIRCLE_SIZE / 2 + CIRCLE_RADIUS * Math.cos(radian);
    const y = CIRCLE_SIZE / 2 + CIRCLE_RADIUS * Math.sin(radian);
    return { x, y };
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Main Content Area */}
      <div className="w-full text-center text-sm text-muted-foreground font-medium px-4 pt-4">
        {exercise?.description}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-8 gap-12">
        {/* Circular Timer Display */}
        <div className="flex flex-col items-center gap-8">
          <div className="relative">
            {/* SVG Circle Container */}
            <svg
              width={CIRCLE_SIZE}
              height={CIRCLE_SIZE}
              className="transform -rotate-90 transition-transform duration-300"
            >
              {/* Background Circle */}
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={CIRCLE_RADIUS}
                fill="none"
                stroke="currentColor"
                strokeWidth={CIRCLE_STROKE_WIDTH}
                className="text-muted/20"
              />

              {/* Progress Circle - Animated */}
              <circle
                cx={CIRCLE_SIZE / 2}
                cy={CIRCLE_SIZE / 2}
                r={CIRCLE_RADIUS}
                fill="none"
                stroke={getCurrentSegmentColor()}
                strokeWidth={CIRCLE_STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={CIRCLE_CIRCUMFERENCE}
                strokeDashoffset={progressOffset}
                className={cn(
                  'transition-all duration-300 ease-linear',
                  isRunning && 'animate-pulse',
                )}
                style={{
                  filter: 'drop-shadow(0 0 8px currentColor)',
                }}
              />

              {/* Segment Dividers */}
              {[0, 1].map((index) => {
                const angle =
                  (index + 1) *
                    (SEGMENT_DURATION_SECONDS / TOTAL_DURATION_SECONDS) *
                    360 -
                  90;
                const radian = (angle * Math.PI) / 180;
                const x1 =
                  CIRCLE_SIZE / 2 +
                  (CIRCLE_RADIUS - CIRCLE_STROKE_WIDTH / 2) * Math.cos(radian);
                const y1 =
                  CIRCLE_SIZE / 2 +
                  (CIRCLE_RADIUS - CIRCLE_STROKE_WIDTH / 2) * Math.sin(radian);
                const x2 =
                  CIRCLE_SIZE / 2 +
                  (CIRCLE_RADIUS + CIRCLE_STROKE_WIDTH / 2) * Math.cos(radian);
                const y2 =
                  CIRCLE_SIZE / 2 +
                  (CIRCLE_RADIUS + CIRCLE_STROKE_WIDTH / 2) * Math.sin(radian);

                return (
                  <line
                    key={index}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="currentColor"
                    strokeWidth={2}
                    className={cn(
                      'transition-opacity duration-300',
                      index < currentSegment
                        ? 'text-foreground opacity-100'
                        : 'text-muted opacity-30',
                    )}
                  />
                );
              })}

              {/* Time Markers on Circle */}
              {timeMarkers.map((marker, index) => {
                const { x, y } = getMarkerPosition(index);
                const isActive = index <= currentSegment;
                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r={6}
                      fill="currentColor"
                      className={cn(
                        'transition-all duration-300',
                        isActive
                          ? 'text-foreground opacity-100'
                          : 'text-muted opacity-30',
                      )}
                    />
                    <text
                      x={x}
                      y={y - 20}
                      textAnchor="middle"
                      className={cn(
                        'text-xs font-medium transition-all duration-300 fill-current',
                        isActive
                          ? 'text-foreground opacity-100'
                          : 'text-muted opacity-50',
                      )}
                    >
                      {marker}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Center Content - Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={cn(
                  'text-5xl sm:text-6xl lg:text-7xl font-mono font-bold tracking-tight transition-all duration-500',
                  'text-sky-400',
                  !isRunning && totalSeconds > 0 && 'opacity-50',
                  isRunning && 'animate-pulse',
                )}
              >
                <span className="tabular-nums">
                  {formatTime(displayHours)}:{formatTime(displayMinutes)}:
                  {formatTime(displaySeconds)}
                </span>
              </div>

              {/* Pause Badge */}
              {!isRunning && totalSeconds > 0 && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-muted px-4 py-1.5 rounded-full border">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Пауза
                    </span>
                  </div>
                </div>
              )}

              {/* Time Label */}
              {isRunning && (
                <div className="mt-4 text-sm text-muted-foreground font-medium animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {displayHours}h {displayMinutes}m {displaySeconds}s
                </div>
              )}
            </div>

            {/* Pulsing Ring Animation when running */}
            {isRunning && (
              <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 animate-ping" />
            )}
          </div>
        </div>

        {/* Control Buttons - Horizontal Layout */}
        <div className="flex items-center gap-3 sm:gap-4 w-full max-w-md">
          <Button
            variant={isRunning ? 'outline' : 'default'}
            size="lg"
            onClick={() => (isRunning ? handlePause() : handleStart())}
            className={cn(
              'flex-1 h-14 sm:h-16 text-base font-semibold gap-2 transition-all duration-300',
              isRunning && 'border-2',
              !isRunning && 'shadow-lg',
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
            className="flex-1 h-14 sm:h-16 bg-green-600 hover:bg-green-700 text-white text-base font-semibold gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg"
          >
            <CheckIcon className="size-5" />
            <span>
              {createSessionMutation.isPending ? 'Збереження...' : 'Завершити'}
            </span>
          </Button>
        </div>
      </div>

      {/* Progress Bar - Fixed Bottom (simplified version) */}
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
                  className="h-full transition-all duration-300 ease-linear shadow-sm"
                  style={{
                    width: `${segmentFillPercent}%`,
                    backgroundColor: segmentColors[segmentIndex],
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

export default OwnTimer2;
