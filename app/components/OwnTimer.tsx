import {
  PauseIcon,
  PlayIcon,
  PlayPauseIcon,
  StopIcon,
} from '@heroicons/react/16/solid';
import { useContext, useEffect, useRef, useState } from 'react';
import { useStopwatch } from 'react-timer-hook';
import type { Exercise, Session } from '~/types/exercise';
import { SupabaseAuthContext } from '~/lib/SupabaseAuthProvider';

const OwnTimer = ({
  onClose,
  exercise,
}: {
  onClose: () => void;
  exercise: Exercise | null;
}) => {
  const { user } = useContext(SupabaseAuthContext);
  const [session, setSession] = useState<Session | null>(null);
  const [displayDuration, setDisplayDuration] = useState<number>(0);
  const startTimeRef = useRef<Date | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const sessionStartTimeRef = useRef<Date | null>(null);

  const {
    totalSeconds,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
  } = useStopwatch({ autoStart: true, interval: 20 });

  useEffect(() => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
      sessionStartTimeRef.current = new Date();
    }
  }, []);

  useEffect(() => {
    if (isRunning && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    } else if (!isRunning && sessionStartTimeRef.current) {
      const pauseTime = new Date();
      const sessionDuration = Math.floor(
        (pauseTime.getTime() - sessionStartTimeRef.current.getTime()) / 1000,
      );
      accumulatedSecondsRef.current += sessionDuration;
      sessionStartTimeRef.current = null;
    }
  }, [isRunning]);

  useEffect(() => {
    const updateDisplay = () => {
      if (isRunning && sessionStartTimeRef.current) {
        const currentTime = new Date();
        const currentSessionDuration = Math.floor(
          (currentTime.getTime() - sessionStartTimeRef.current.getTime()) /
            1000,
        );
        setDisplayDuration(
          accumulatedSecondsRef.current + currentSessionDuration,
        );
      } else {
        setDisplayDuration(accumulatedSecondsRef.current);
      }
    };

    updateDisplay();
    const interval = setInterval(updateDisplay, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (num: number) => String(num).padStart(2, '0');

  const handlePause = () => {
    pause();
  };

  const handleStart = () => {
    if (!sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date();
    }
    start();
  };

  const handleStop = () => {
    if (!exercise || !user?.id || !startTimeRef.current) {
      onClose();
      return;
    }

    const startAt = startTimeRef.current;
    const endAt = new Date();

    let durationSeconds: number;
    if (isRunning && sessionStartTimeRef.current) {
      const currentSessionDuration = Math.floor(
        (endAt.getTime() - sessionStartTimeRef.current.getTime()) / 1000,
      );
      durationSeconds = accumulatedSecondsRef.current + currentSessionDuration;
    } else {
      durationSeconds = accumulatedSecondsRef.current;
    }

    const sessionData: Session = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      exercise_id: exercise.id,
      user_id: user.id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      duration_seconds: durationSeconds,
    };

    console.log(sessionData);
    setSession(sessionData);
    onClose();
  };

  const displayHours = Math.floor(displayDuration / 3600);
  const displayMinutes = Math.floor((displayDuration % 3600) / 60);
  const displaySeconds = displayDuration % 60;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-6xl font-bold w-full text-center flex flex-row items-center justify-center gap-1">
        <span className="w-[80px]">{formatTime(displayHours)}</span>
        <span className="mx-1">:</span>
        <span className="w-[80px]">{formatTime(displayMinutes)}</span>
        <span className="mx-1">:</span>
        <span className="w-[80px]">{formatTime(displaySeconds)}</span>
      </div>
      <div className="text-sm text-gray-500">
        {displayHours}h {displayMinutes}m {displaySeconds}s
      </div>
      <div className="flex flex-row gap-10 pt-10">
        <button
          className="bg-gray-500 text-white w-32 h-32 rounded-full flex items-center justify-center hover:bg-gray-600 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5"
          onClick={() => (isRunning ? handlePause() : handleStart())}
        >
          {isRunning ? (
            <PauseIcon className="size-12" />
          ) : (
            <PlayPauseIcon className="size-12" />
          )}
        </button>
        <button
          className="bg-gray-800 text-white w-32 h-32 rounded-full flex items-center justify-center hover:bg-gray-900 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] active:shadow-md active:translate-y-0.5"
          onClick={handleStop}
        >
          <StopIcon className="size-12" />
        </button>
      </div>
    </div>
  );
};

export default OwnTimer;
