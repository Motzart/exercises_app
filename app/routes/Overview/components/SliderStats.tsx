import React, { useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ClockIcon } from '@heroicons/react/16/solid';
import { useExercisesWeekStats } from "~/hooks/useTotalDuration";

const SliderStats = () => {
  const sliderRef = useRef<Slider>(null);
  const { data: exercisesStats = [], isLoading } = useExercisesWeekStats();

  const next = () => {
    sliderRef.current?.slickNext();
  };

  const previous = () => {
    sliderRef.current?.slickPrev();
  };

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  // Group exercises into slides (e.g., 7 exercises per slide)
  const exercisesPerSlide = 7;
  const slides = [];
  for (let i = 0; i < exercisesStats.length; i += exercisesPerSlide) {
    slides.push(exercisesStats.slice(i, i + exercisesPerSlide));
  }

  // If no slides, create at least one empty slide
  if (slides.length === 0) {
    slides.push([]);
  }

  return (
    <div className="slider-container mt-8">
      <div className="border-t border-gray-600/30 mb-4"></div>
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-300 text-sm font-bold tracking-wider">
          Сумарно за поточний тиждень
        </h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-800/50 rounded-lg p-2 hover:bg-gray-800/70 transition-colors"
            onClick={previous}
            disabled={slides.length <= 1}
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
            className="bg-gray-800/50 rounded-lg p-2 hover:bg-gray-800/70 transition-colors"
            onClick={next}
            disabled={slides.length <= 1}
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
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600/30 mb-4"></div>

      {isLoading ? (
        <div className="text-gray-300 text-center py-8">Loading...</div>
      ) : (
        <Slider ref={sliderRef} {...settings}>
          {slides.map((slideExercises, slideIndex) => (
            <div key={slideIndex}>
              <ul className="space-y-2 bg-gray-800/50 rounded-lg p-4">
                {slideExercises.length === 0 ? (
                  <li className="text-gray-400 text-center py-8 ">
                    No exercises this week
                  </li>
                ) : (
                  slideExercises.map((exercise) => (
                    <li
                      key={exercise.exerciseId}
                      className="flex items-center justify-between py-2 "
                    >
                      {/* Exercise name on the left */}
                      <span className="text-gray-300 text-sm">
                        {exercise.exerciseName}
                      </span>
                      {/* Time on the right */}
                      <div className="flex items-center gap-2">
                        <ClockIcon className="size-4 text-gray-300" />
                        <span className="text-gray-300 text-sm">
                          {exercise.durationMinutes} хв.
                        </span>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default SliderStats;
