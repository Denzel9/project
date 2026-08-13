import { Close } from '@mui/icons-material'
import { Box, IconButton, Popover, TextField } from '@mui/material'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'

import { DateCalendarFilter } from '@/shared'

type FilterDateFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  size?: 'small' | 'medium'
}

export const FilterDateField = ({
  label,
  value,
  onChange,
  size = 'medium',
}: FilterDateFieldProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const displayValue = value
    ? format(dayjs(value).toDate(), 'dd.MM.yyyy', { locale: ru })
    : ''

  const handleChange = (date: Dayjs | null) => {
    onChange(date?.isValid() ? date.format('YYYY-MM-DD') : '')
    setAnchorEl(null)
  }

  const handleClear = () => {
    onChange('')
    setAnchorEl(null)
  }

  return (
    <Box>
      <TextField
        fullWidth
        size={size}
        label={label}
        value={displayValue}
        onClick={event => setAnchorEl(event.currentTarget)}
        slotProps={{
          input: {
            readOnly: true,
            sx: { cursor: 'pointer' },
            endAdornment: value ? (
              <IconButton
                size="small"
                aria-label="Сбросить дату"
                onClick={event => {
                  event.stopPropagation()
                  handleClear()
                }}
              >
                <Close fontSize="small" />
              </IconButton>
            ) : undefined,
          },
        }}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          '& .MuiPopover-paper': {
            borderRadius: '32px',
          },
        }}
      >
        <DateCalendarFilter
          value={value || null}
          onChange={handleChange}
          onClear={handleClear}
        />
      </Popover>
    </Box>
  )
}
