import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  layout('routes/auth/layout.tsx', [
    index('routes/HomePage.tsx'),
    route('/overview', 'routes/Overview/OverviewPage.tsx'),
    route('/calendar', 'routes/CalendarPage.tsx'),
    route('/history', 'routes/HistoryPage.tsx'),
    route('/play-lists', 'routes/PlayListsPage.tsx'),
    route('/exercises', 'routes/ExercisesPage.tsx'),
    route('/helpers', 'routes/Helpers/HelpersPage.tsx'),
  ]),
  route('/login', 'routes/LoginPage.tsx'),
] satisfies RouteConfig;
