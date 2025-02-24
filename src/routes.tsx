
import { createBrowserRouter } from 'react-router-dom';
import Chat from './pages/Chat';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/chat',
    element: <Chat />,
  },
  {
    path: '/chat/:id',
    element: <Chat />,
  },
  {
    path: '/chat/profile',
    element: <Chat />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
