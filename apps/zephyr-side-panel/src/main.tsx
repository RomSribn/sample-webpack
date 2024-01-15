import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app/app';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline></CssBaseline>
      <App />
    </ThemeProvider>
  </StrictMode>
);
