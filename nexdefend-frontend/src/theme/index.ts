import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // Default to dark mode as per "Cyber-Tactical" memory
    primary: {
      main: '#00D1FF', // Neon Blue accent
    },
    secondary: {
      main: '#F50057', // Neon Pink
    },
    background: {
      default: '#0F172A', // Dark Slate
      paper: '#1E293B',
    },
    text: {
      primary: '#F8FAFC',
      secondary: '#94A3B8',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2rem', fontWeight: 600 },
    h2: { fontSize: '1.5rem', fontWeight: 600 },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'none', // flat style
        },
      },
    },
  },
});

export default theme;
