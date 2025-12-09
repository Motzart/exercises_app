import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  PlayPauseIcon,
} from '@heroicons/react/16/solid';
import { useContext, useEffect, useRef, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import type { CreateSessionInput, Exercise, Session } from '~/types/exercise';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';
import { useCreateSession } from '~/hooks/useSession';

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
    autoStart: true,
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
  // Progress bar configuration: 20 minutes = 1200 seconds, 4 segments of 5 minutes each
  const TOTAL_DURATION_SECONDS = 20 * 60; // 1200 seconds
  const SEGMENT_DURATION_SECONDS = 5 * 60; // 300 seconds per segment

  // Calculate which segment we're in and how much of it is filled
  const currentSegment = Math.min(
    Math.floor(totalSeconds / SEGMENT_DURATION_SECONDS),
    3,
  );
  const segmentProgress =
    currentSegment < 4
      ? ((totalSeconds % SEGMENT_DURATION_SECONDS) / SEGMENT_DURATION_SECONDS) *
        100
      : 100;

  const segmentColors = [
    'bg-red-500', // 0-5 minutes: red
    'bg-orange-500', // 5-10 minutes: orange
    'bg-yellow-500', // 10-15 minutes: yellow
    'bg-green-500', // 15-20 minutes: green
  ];

  const timeMarkers = ['5хв', '10хв', '15хв', '20хв'];

  return (
    <div className="flex flex-col w-full h-full">
      {/* Timer content */}
      <div className="flex flex-col items-center justify-center pb-32 relative">
        <div
          className={`text-6xl font-bold w-full text-center flex flex-row items-center justify-center gap-1 transition-opacity duration-300 ${
            !isRunning ? 'opacity-40' : ''
          }`}
        >
          <span className="w-[80px]">{formatTime(displayHours)}</span>
          <span className="mx-1">:</span>
          <span className="w-[80px]">{formatTime(displayMinutes)}</span>
          <span className="mx-1">:</span>
          <span className="w-[80px]">{formatTime(displaySeconds)}</span>
        </div>
        <div
          className={`text-sm text-gray-500 transition-opacity duration-300 ${
            !isRunning ? 'opacity-40' : ''
          }`}
        >
          {displayHours}h {displayMinutes}m {displaySeconds}s
        </div>
        {!isRunning && (
          <div className="absolute inset-0 flex justify-center pointer-events-none">
            <div className="bg-gray-800/80 w-2xl h-[80px] rounded-full flex items-center justify-center">
              <div className="text-4xl font-bold text-white">Пауза</div>
            </div>
          </div>
        )}
        <div className="flex flex-row gap-10 pt-10">
          <button
            className="bg-gray-500 text-white w-32 h-32 rounded-full flex items-center justify-center hover:bg-gray-600 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5"
            onClick={() => (isRunning ? handlePause() : handleStart())}
          >
            {isRunning ? (
              <div className="flex flex-col items-center justify-center">
                <PauseIcon className="size-12" />
                <span className="text-sm font-bold text-white">pause</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <PlayPauseIcon className="size-12" />
                <span className="text-sm font-bold text-white">pause</span>
              </div>
            )}
          </button>
          <button
            className="bg-green-700 text-white w-32 h-32 rounded-full flex items-center justify-center hover:bg-green-500 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5"
            onClick={handleStop}
          >
            <div className="flex flex-col items-center justify-center">
              <CheckIcon className="size-12" />
              <span className="text-sm font-bold text-white">done</span>
            </div>
          </button>
        </div>
      </div>

      {/* Full-width progress bar at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-200 z-50">
        <div className="flex h-8 w-full relative">
          {[0, 1, 2, 3].map((segmentIndex) => {
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
                className="relative"
                style={{ width: '25%' }}
              >
                <div
                  className={`${segmentColors[segmentIndex]} h-full transition-all duration-300 ease-linear`}
                  style={{
                    width: `${segmentFillPercent}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        {/* Time markers */}
        <div className="flex w-full bg-gray-600 py-2">
          {timeMarkers.map((marker, index) => (
            <div
              key={index}
              className="flex-1 text-center text-xs text-white font-medium"
              style={{ width: '25%' }}
            >
              {marker}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnTimer;
