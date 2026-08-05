import { createTheme } from '@mui/material';

export const BASE_COLOR = 'rgb(77, 144, 142)';
export const BASE_LIGHT_COLOR = 'rgba(94, 174, 171, 0.83)';
export const BASE_EXTRA_LIGHT_COLOR = 'rgba(99, 182, 179, 0.23)';

export const SECONDARY_COLOR = 'rgb(231, 231, 231)';
export const SECONDARY_LIGHT_COLOR = 'rgb(245, 245, 245)';
export const SECONDARY_DARK_COLOR = 'rgb(151, 150, 150)';

export const INFO_COLOR = 'rgb(104, 104, 104)';

export const theme = createTheme({
    palette: {
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
        text: {
            primary: 'rgb(0, 0, 0)',
        },
    },
    typography: {
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
    },
    components: {
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

        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#fff',
                    color: 'rgba(0, 0, 0, 0.87)',
                    padding: '10px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: '12px',
                    border: `1px solid ${SECONDARY_COLOR}`,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                },
                arrow: {
                    color: '#fff',
                    '&::before': {
                        border: `1px solid ${SECONDARY_COLOR}`,
                        backgroundColor: '#fff',
                        boxSizing: 'border-box',
                    },
                },
            },
        },
    },
}
);