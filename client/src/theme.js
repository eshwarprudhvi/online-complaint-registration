import { createTheme } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  spacing: 8, // Enforces 8px grid (1 = 8px, 2 = 16px, 3 = 24px, 4 = 32px, etc.)
  palette: {
    mode,
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    secondary: {
      main: '#009688',
      light: '#33ab9f',
      dark: '#00695f',
      contrastText: '#fff',
    },
    success: { main: '#4caf50' },
    warning: { main: '#ff9800' },
    error: { main: '#f44336' },
    background: {
      default: mode === 'light' ? '#f5f7fa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#212121' : '#f0f0f0',
      secondary: mode === 'light' ? '#616161' : '#b0b0b0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, lineHeight: 1.2 },
    h2: { fontWeight: 700, lineHeight: 1.2 },
    h3: { fontWeight: 600, lineHeight: 1.3 },
    h4: { fontWeight: 600, lineHeight: 1.3 },
    h5: { fontWeight: 600, lineHeight: 1.4 },
    h6: { fontWeight: 600, lineHeight: 1.4 },
    body1: { lineHeight: 1.6, fontSize: '1rem' },
    body2: { lineHeight: 1.5, fontSize: '0.875rem' },
    button: { textTransform: 'none', fontWeight: 600, fontSize: '1rem' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '10px 24px',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' 
            ? '0px 4px 24px rgba(0, 0, 0, 0.06)' 
            : '0px 4px 24px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'none',
          padding: '8px', // Default card padding buffer
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '32px', // 32px internal padding for cards
          '&:last-child': {
            paddingBottom: '32px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
      styleOverrides: {
        root: {
          marginBottom: '24px', // 24px between form fields globally
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          fontSize: '0.875rem',
          '& .MuiDataGrid-cell': {
            borderBottom: mode === 'light' 
              ? '1px solid rgba(0, 0, 0, 0.06)' 
              : '1px solid rgba(255, 255, 255, 0.06)',
            padding: '12px 16px',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: mode === 'light' ? '#fafafa' : '#1a1a1a',
            borderBottom: mode === 'light'
              ? '1px solid rgba(0, 0, 0, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          },
          '& .MuiDataGrid-columnHeader': {
            padding: '0 16px',
          },
          // Hide column separators (v7+ compatible)
          '& .MuiDataGrid-columnSeparator': {
            display: 'none !important',
          },
          '& [class*="columnSeparator"]': {
            display: 'none !important',
          },
          // Remove focus outlines
          '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none !important',
          },
          '& .MuiDataGrid-cell:focus-within': {
            outline: 'none !important',
          },
          // Row styling
          '& .MuiDataGrid-row': {
            '&:hover': {
              backgroundColor: mode === 'light' 
                ? 'rgba(0, 0, 0, 0.02)' 
                : 'rgba(255, 255, 255, 0.03)',
            },
          },
          // Footer / pagination
          '& .MuiDataGrid-footerContainer': {
            borderTop: mode === 'light'
              ? '1px solid rgba(0, 0, 0, 0.08)'
              : '1px solid rgba(255, 255, 255, 0.08)',
          },
          // Remove outer border on the container
          '& .MuiDataGrid-main': {
            border: 'none',
          },
        },
        toolbarContainer: {
          padding: '16px',
        },
      },
    },
  },
});

export const createAppTheme = (mode) => createTheme(getDesignTokens(mode));
