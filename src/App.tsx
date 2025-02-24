
import { ThemeProvider } from 'next-themes';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes.tsx';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <ThemeProvider defaultTheme="light" attribute="class" enableSystem={false} disableTransitionOnChange>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
