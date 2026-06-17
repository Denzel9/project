import { FormControl, FormLabel, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { BASE_COLOR } from '@/app/index';
import { RHFInput } from '@/shared/ui/rhf';

import type { TaskFormType } from '../model/schema/schema';

type TaskFormFieldsProps = {
  isOwner?: boolean;
};

export const TaskFormFields = ({ isOwner = false }: TaskFormFieldsProps) => {
  const { control } = useFormContext<TaskFormType>();

  const { description, photoCount, videoCount, finalDate } = useWatch({
    control,
  });

  return (
    <Stack
      spacing={4}
      sx={{ mb: 8 }}
    >
      {isOwner ? (
        <RHFInput
          name="description"
          control={control}
          props={{
            minRows: 6,
            fullWidth: true,
            multiline: true,
            label: 'Описание',
          }}
        />
      ) : (
        <FormControl
          fullWidth
          disabled={!isOwner}
        >
          <FormLabel sx={{ mb: 2, fontWeight: 600, fontSize: '24px' }}>
            Описание
          </FormLabel>
          <Typography variant="body1">{description}</Typography>
        </FormControl>
      )}

      <Stack
        direction={isOwner ? 'column' : 'row'}
        spacing={2}
      >
        {isOwner ? (
          <RHFInput
            name="photoCount"
            control={control}
            props={{
              label: 'Кол-во фото',
              sx: { width: '50%' },
            }}
          />
        ) : (
          <FormControl
            fullWidth
            disabled={!isOwner}
          >
            <FormLabel sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}>
              Кол-во фото
            </FormLabel>
            <Typography variant="body1">{photoCount}</Typography>
          </FormControl>
        )}

        {isOwner ? (
          <RHFInput
            name="videoCount"
            control={control}
            props={{
              label: 'Кол-во видео',
              sx: { width: '50%' },
            }}
          />
        ) : (
          <FormControl
            fullWidth
            disabled={!isOwner}
          >
            <FormLabel sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}>
              Кол-во видео
            </FormLabel>
            <Typography variant="body1">{videoCount}</Typography>
          </FormControl>
        )}

        {isOwner ? (
          <Controller
            name="finalDate"
            control={control}
            render={({ field, fieldState }) => (
              <DateTimePicker
                label="Дедлайн"
                value={field.value ? dayjs(field.value) : null}
                onChange={(value: Dayjs | null) =>
                  field.onChange(value?.isValid() ? value.toISOString() : null)
                }
                slotProps={{
                  textField: {
                    error: Boolean(fieldState.error),
                    helperText: fieldState.error?.message,
                  },
                }}
                sx={{
                  width: '50%',
                  '& .MuiPickersOutlinedInput-root': {
                    borderRadius: '16px',
                    '&:hover .MuiPickersOutlinedInput-notchedOutline': {
                      borderColor: BASE_COLOR,
                    },
                    '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                      borderColor: BASE_COLOR,
                      borderWidth: '2px',
                    },
                  },
                  '& .MuiDatePicker-inputLabel.Mui-focused': {
                    color: BASE_COLOR,
                  },
                }}
              />
            )}
          />
        ) : (
          <FormControl
            fullWidth
            disabled={!isOwner}
          >
            <FormLabel sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}>
              Дедлайн
            </FormLabel>
            <Typography variant="body1">{finalDate}</Typography>
          </FormControl>
        )}
      </Stack>
    </Stack>
  );
};
