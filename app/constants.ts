export interface SettingsInterface {
  minTimeSessionByDay: number;
  minTimeForSession: number;
}

// Setting object fo ui parts
// all time in seconds
export const settings: SettingsInterface = {
  minTimeSessionByDay: 3600, // 1 hour
  minTimeForSession: 600, // 10 minutes
};
