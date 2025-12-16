export const formatDuration = (seconds: number): string => {
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)} хвилин`;
};
