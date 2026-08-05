import type { SxProps, Theme } from '@mui/material'

/** Day button size — keep in sync with CalendarPickerDay cell. */
export const CALENDAR_DAY_SIZE = 40
export const CALENDAR_DAY_CELL_WIDTH = 48
export const CALENDAR_DAY_CELL_HEIGHT = 52

export const CALENDAR_CARD_SX: SxProps<Theme> = {
  p: { xs: 1.5, md: 2 },
  bgcolor: 'white',
  borderRadius: '32px',
  border: '1px solid',
  borderColor: 'divider',
  overflow: 'hidden',
}

export const DATE_CALENDAR_SX: SxProps<Theme> = {
  width: '100%',
  maxWidth: 360,
  mx: 'auto',
  height: 'auto',
  maxHeight: 'none',
  overflow: 'visible',
  '& .MuiPickersCalendarHeader-root': {
    pl: 1,
    pr: 0.5,
    mt: 0.5,
    mb: 0.5,
  },
  '& .MuiPickersSlideTransition-root, & .MuiDayCalendar-slideTransition': {
    minHeight: CALENDAR_DAY_CELL_HEIGHT * 6,
    overflow: 'visible !important',
  },
  '& .MuiDayCalendar-monthContainer': {
    overflow: 'visible',
  },
  '& .MuiPickersDay-root': {
    width: CALENDAR_DAY_SIZE,
    height: CALENDAR_DAY_SIZE,
    fontSize: '0.875rem',
    fontWeight: 500,
    margin: 0,
  },
  '& .MuiDayCalendar-weekContainer': {
    my: 0.5,
    justifyContent: 'space-between',
  },
  '& .MuiDayCalendar-header': {
    justifyContent: 'space-between',
    px: 0.25,
  },
  '& .MuiDayCalendar-weekDayLabel': {
    width: CALENDAR_DAY_CELL_WIDTH,
    margin: 0,
    fontSize: '0.75rem',
    color: 'text.secondary',
  },
}
