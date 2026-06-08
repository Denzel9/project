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
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    padding: '10px 48px',
                },
            },
        },
    },
}
);