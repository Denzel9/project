import { createTheme, type ThemeOptions } from '@mui/material';

export type ThemeMode = 'light' | 'dark';

export const THEME_MODE_STORAGE_KEY = 'nikssens-theme-mode';

export const BASE_COLOR = 'rgb(77, 144, 142)';
export const BASE_LIGHT_COLOR = 'rgba(94, 174, 171, 0.83)';
export const BASE_EXTRA_LIGHT_COLOR = 'rgba(99, 182, 179, 0.23)';

export const SECONDARY_COLOR = 'rgb(231, 231, 231)';
export const SECONDARY_LIGHT_COLOR = 'rgb(245, 245, 245)';
export const SECONDARY_DARK_COLOR = 'rgb(151, 150, 150)';

export const DARK_SECONDARY_COLOR = 'rgba(255, 255, 255, 0.12)';
export const DARK_SECONDARY_LIGHT_COLOR = 'rgba(255, 255, 255, 0.08)';
export const DARK_SECONDARY_DARK_COLOR = 'rgba(255, 255, 255, 0.24)';

export const INFO_COLOR = 'rgb(104, 104, 104)';
export const DARK_INFO_COLOR = '#B3B3B3';

const typography: ThemeOptions['typography'] = {
  fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  h1: { fontWeight: 700, letterSpacing: '-0.03em' },
  h2: { fontWeight: 700, letterSpacing: '-0.025em' },
  h3: { fontWeight: 700, letterSpacing: '-0.02em' },
  h4: { fontWeight: 700, letterSpacing: '-0.02em' },
  h5: { fontWeight: 700, letterSpacing: '-0.015em' },
  h6: { fontWeight: 700, letterSpacing: '-0.01em' },
  subtitle1: { fontWeight: 600 },
  subtitle2: { fontWeight: 600 },
  button: { fontWeight: 600, letterSpacing: '-0.01em' },
  body1: { fontWeight: 500, letterSpacing: '-0.01em' },
  body2: { fontWeight: 500, letterSpacing: '-0.005em' },
  caption: { fontWeight: 500 },
};

const getComponents = (mode: ThemeMode): ThemeOptions['components'] => ({
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: '16px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: BASE_COLOR,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: BASE_COLOR,
            borderWidth: '2px',
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: BASE_COLOR,
        },
      },
    },
  },

  MuiSwitch: {
    styleOverrides: {
      root: {
        '& .MuiSwitch-track': {
          backgroundColor: BASE_COLOR,
        },
        '& .MuiSwitch-thumb': {
          border: `1px solid ${BASE_COLOR}`,
        },
      },
    },
  },

  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: '16px',
        padding: '10px 48px',
        textTransform: 'none',
      },
    },
  },

  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: '32px',
      },
    },
  },

  MuiMenuItem: {
    styleOverrides: {
      root: {
        fontSize: 14,
        '& .MuiListItemText-primary': {
          fontSize: 14,
        },
      },
    },
  },

  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
    },
  },

  MuiAutocomplete: {
    defaultProps: {
      noOptionsText: 'Ничего не найдено',
      loadingText: 'Загрузка…',
      clearText: 'Очистить',
      closeText: 'Закрыть',
      openText: 'Открыть',
    },
  },

  MuiTooltip: {
    styleOverrides: {
      tooltip: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: '10px 14px',
        fontSize: '0.8125rem',
        fontWeight: 500,
        borderRadius: '12px',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow:
          mode === 'dark'
            ? '0 4px 16px rgba(0, 0, 0, 0.32)'
            : '0 4px 16px rgba(0, 0, 0, 0.08)',
      }),
      arrow: ({ theme }) => ({
        color: theme.palette.background.paper,
        '&::before': {
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          boxSizing: 'border-box',
        },
      }),
    },
  },

  ...(mode === 'dark'
    ? {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#1F2426',
            color: '#FFFFFF',
          },
        },
      },
    }
    : {}),
});

export const createAppTheme = (mode: ThemeMode = 'light') =>
  createTheme({
    palette:
      mode === 'dark'
        ? {
          mode: 'dark',
          background: {
            default: '#1F2426',
            paper: '#1A1A1A',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#B3B3B3',
          },
          primary: {
            main: BASE_COLOR,
            light: BASE_LIGHT_COLOR,
            contrastText: '#0D0D0D',
          },
          secondary: {
            main: DARK_SECONDARY_COLOR,
            light: DARK_SECONDARY_LIGHT_COLOR,
            dark: DARK_SECONDARY_DARK_COLOR,
          },
          info: {
            main: DARK_INFO_COLOR,
            light: BASE_EXTRA_LIGHT_COLOR,
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        }
        : {
          mode: 'light',
          background: {
            default: 'rgb(244, 244, 244)',
            paper: '#FFFFFF',
          },
          text: {
            primary: 'rgb(0, 0, 0)',
            secondary: INFO_COLOR,
          },
          primary: {
            main: BASE_COLOR,
            light: BASE_LIGHT_COLOR,
          },
          secondary: {
            main: SECONDARY_COLOR,
            light: SECONDARY_LIGHT_COLOR,
            dark: SECONDARY_DARK_COLOR,
          },
          info: {
            main: INFO_COLOR,
            light: BASE_EXTRA_LIGHT_COLOR,
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        },
    typography,
    components: getComponents(mode),
  });

/** @deprecated Prefer `createAppTheme` via `ThemeModeProvider` */
export const theme = createAppTheme('light');
