import type { RouteRecord } from 'vite-react-ssg';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Balance from './pages/Balance';
import Worldcup from './pages/Worldcup';
import MvWorldcup from './pages/MvWorldcup';
import Fancam from './pages/Fancam';
import Fortune from './pages/Fortune';
import Birthday from './pages/Birthday';

export const routes: RouteRecord[] = [
  { path: '/', element: <Home />, entry: 'src/pages/Home.tsx' },
  { path: '/quiz', element: <Quiz />, entry: 'src/pages/Quiz.tsx' },
  { path: '/balance', element: <Balance />, entry: 'src/pages/Balance.tsx' },
  { path: '/worldcup', element: <Worldcup />, entry: 'src/pages/Worldcup.tsx' },
  { path: '/mv-worldcup', element: <MvWorldcup />, entry: 'src/pages/MvWorldcup.tsx' },
  { path: '/fancam-worldcup', element: <Fancam />, entry: 'src/pages/Fancam.tsx' },
  { path: '/fortune', element: <Fortune />, entry: 'src/pages/Fortune.tsx' },
  { path: '/birthday', element: <Birthday />, entry: 'src/pages/Birthday.tsx' },
];
