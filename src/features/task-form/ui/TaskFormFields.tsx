import { Stack } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { BASE_COLOR } from '@/app/index';
import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities';
import { scrollMainToTop, RHFInput } from '@/shared';
import { DatePickerProvider } from '@/widgets';

import { DescriptionBlock } from './DescriptionBlock';
import { EditField } from './EditField';

import type { TaskFormType } from '../model/schema/schema';

type TaskFormFieldsProps = {
  isMe: boolean;
  isEdit: boolean;
  status: TaskStatus;
  isOpenDescription: boolean;
  setIsEdit: (isEdit: boolean) => void;
  setIsOpenDescription: (isOpen: boolean) => void;
};

export const TaskFormFields = ({
  isMe,
  status,
  isEdit,
  setIsEdit,
  isOpenDescription,
  setIsOpenDescription,
}: TaskFormFieldsProps) => {
  const { control } = useFormContext<TaskFormType>();

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

  const isEditEnabled =
    isEdit &&
    ![TASK_STATUS_ENUM.CANCELLED, TASK_STATUS_ENUM.CANCELLED_EXECUTOR].includes(
      status as TASK_STATUS_ENUM
    );

  return (
    <DatePickerProvider>
      <Stack
        spacing={4}
        sx={{
          mb: [
            TASK_STATUS_ENUM.CANCELLED,
            TASK_STATUS_ENUM.CANCELLED_EXECUTOR,
          ].includes(status as TASK_STATUS_ENUM)
            ? 0
            : 8,
        }}
      >
        <EditField
          name="title"
          canEdit={isMe}
          setIsEdit={setIsEdit}
          fieldLabel="заголовок"
          isEdit={isEditEnabled}
        >
          <RHFInput
            name="title"
            control={control}
            props={{
              label: 'Заголовок',
              sx: { width: '50%' },
            }}
          />
        </EditField>

        <DescriptionBlock
          isMe={isMe}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          description={description ?? ''}
          isOpenDescription={isOpenDescription}
          handleOpenDescription={handleOpenDescription}
        />

        <Stack
          direction="row"
          spacing={2}
        >
          <EditField
            name="photoCount"
            label="Кол-во фото"
            isEdit={isEditEnabled}
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
            isEdit={isEditEnabled}
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
            isEdit={isEditEnabled}
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
                    field.onChange(
                      value?.isValid() ? value.toISOString() : null
                    )
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
    </DatePickerProvider>
  );
};
