import { Close } from '@mui/icons-material';
import { Box, IconButton, Popover, TextField } from '@mui/material';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';

import { DateCalendarFilter } from '@/shared';

type ColumnDateFilterProps = {
  value: string | null;
  placeholder: string;
  todayLabel: string;
  onChange: (value: string | null) => void;
};

const todayKey = () => dayjs().format('YYYY-MM-DD');

export const ColumnDateFilter = ({
  value,
  placeholder,
  todayLabel,
  onChange,
}: ColumnDateFilterProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const displayValue = value
    ? value === todayKey()
      ? todayLabel
      : format(dayjs(value).toDate(), 'dd.MM.yyyy', { locale: ru })
    : '';

  const handleChange = (date: Dayjs | null) => {
    onChange(date?.isValid() ? date.format('YYYY-MM-DD') : null);
    setAnchorEl(null);
  };

  const handleClear = () => {
    onChange(null);
    setAnchorEl(null);
  };

  return (
    <Box onClick={event => event.stopPropagation()}>
      <TextField
        size="small"
        fullWidth
        variant="standard"
        placeholder={placeholder}
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
                  event.stopPropagation();
                  handleClear();
                }}
                sx={{ p: 0.25, mr: -0.5 }}
              >
                <Close sx={{ fontSize: 16 }} />
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
          value={value}
          onChange={handleChange}
          onClear={handleClear}
        />
      </Popover>
    </Box>
  );
};
