import { useState, useEffect } from 'react';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

function getRandomNote() {
  return NOTES[Math.floor(Math.random() * NOTES.length)];
}

function RandomNote() {
  const [currentNote, setCurrentNote] = useState(() => getRandomNote());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNote(getRandomNote());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  function handleClick() {
    setCurrentNote(getRandomNote());
  }

  return (
    <div className="container mx-auto relative isolate overflow-hidden pt-16">
      <div
        className="flex items-center justify-center min-h-[calc(100vh-8rem)] cursor-pointer"
        onClick={handleClick}
      >
        <div className="text-9xl font-bold text-gray-100 select-none">
          {currentNote}
        </div>
      </div>
    </div>
  );
}

export default RandomNote;
