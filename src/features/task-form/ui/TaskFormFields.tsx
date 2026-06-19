import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { BASE_COLOR } from '@/app/index';
import { scrollMainToTop } from '@/shared';
import { MarkdownContent, RHFRichTextEditor } from '@/shared/ui/markdown';
import { RHFInput } from '@/shared/ui/rhf';

import { EditField } from './EditField';

import type { TaskFormType } from '../model/schema/schema';

type TaskFormFieldsProps = {
  isEdit: boolean;
  isOpenDescription: boolean;
  setIsEdit: (isEdit: boolean) => void;
  setIsOpenDescription: (isOpen: boolean) => void;
};

export const TaskFormFields = ({
  setIsEdit,
  isEdit,
  isOpenDescription,
  setIsOpenDescription,
}: TaskFormFieldsProps) => {
  const {
    control,
    formState: { errors },
  } = useFormContext<TaskFormType>();

  const { description } = useWatch({
    control,
  });

  const handleOpenDescription = () => {
    const willCollapse = isOpenDescription;

    setIsOpenDescription(!isOpenDescription);

    if (willCollapse) {
      requestAnimationFrame(() => {
        scrollMainToTop();
      });
    }
  };

  return (
    <Stack
      spacing={4}
      sx={{
        mb: 8,
      }}
    >
      {isEdit ? (
        <RHFRichTextEditor
          name="description"
          control={control}
          maxLength={5000}
          minHeight={isOpenDescription ? 320 : 160}
        />
      ) : description ? (
        <Stack
          spacing={1}
          direction="column"
        >
          <MarkdownContent
            content={description}
            sx={{
              overflowY: isOpenDescription ? 'visible' : 'auto',
              maxHeight: isOpenDescription
                ? 'none'
                : description?.length > 1000
                  ? '300px'
                  : 'none',
            }}
          />

          {description && description?.length > 1000 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                color="primary"
                onClick={handleOpenDescription}
              >
                {isOpenDescription ? (
                  <KeyboardArrowUp />
                ) : (
                  <KeyboardArrowDown />
                )}
              </IconButton>
            </Box>
          )}
        </Stack>
      ) : (
        <Typography
          onClick={() => setIsEdit(true)}
          sx={{
            color: errors.description ? 'error.main' : 'info.main',
            fontWeight: 500,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            ':hover': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
        >
          Добавить описание
        </Typography>
      )}

      <Stack
        direction="row"
        spacing={2}
      >
        <EditField
          name="photoCount"
          label="Кол-во фото"
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        >
          <RHFInput
            name="photoCount"
            control={control}
            props={{
              label: 'Кол-во фото',
              sx: { width: '50%' },
            }}
          />
        </EditField>

        <EditField
          name="videoCount"
          label="Кол-во видео"
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        >
          <RHFInput
            name="videoCount"
            control={control}
            props={{
              label: 'Кол-во видео',
              sx: { width: '50%' },
            }}
          />
        </EditField>

        <EditField
          isDate
          name="finalDate"
          label="Дедлайн"
          isEdit={isEdit}
          setIsEdit={setIsEdit}
        >
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
        </EditField>
      </Stack>
    </Stack>
  );
};
