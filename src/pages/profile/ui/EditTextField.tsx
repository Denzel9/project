import { TextField, Typography, type TextFieldProps } from '@mui/material';
import { type ComponentType } from 'react';
import {
  Controller,
  useFormContext,
  useWatch,
  type ControllerFieldState,
} from 'react-hook-form';

type EditModalFieldProps = {
  name: string;
  isMe: boolean;
  isEdit: boolean;
  maxLength?: number;
  placeholder: string;
  isMultiline?: boolean;
  InputField?: ComponentType<TextFieldProps>;
};

export const EditTextField = ({
  name,
  isMe,
  isEdit,
  placeholder,
  isMultiline = false,
  maxLength = undefined,
  InputField = TextField,
}: EditModalFieldProps) => {
  const { control } = useFormContext();

  const value = useWatch({ control, name });

  const getHelperText = (fieldState: ControllerFieldState) => {
    if (fieldState.error?.message) {
      return fieldState.error?.message;
    }
    if (maxLength && value?.length) {
      return `${value?.length} / ${maxLength}`;
    }
    return '';
  };

  if (value && !isEdit) {
    return <Typography>{value}</Typography>;
  }

  if (isEdit) {
    return (
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <InputField
            {...field}
            rows={4}
            fullWidth
            label={placeholder}
            multiline={isMultiline}
            error={Boolean(fieldState.error)}
            helperText={getHelperText(fieldState)}
            // slotProps={
            //   {
            //     // htmlInput: { maxLength },
            //   }
            // }
          />
        )}
      />
    );
  }

  return isMe ? (
    <Typography
      variant="body1"
      sx={{
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        opacity: 0.5,
        '&:hover': { opacity: 1 },
      }}
    >
      {placeholder}
    </Typography>
  ) : (
    <Typography
      variant="body1"
      sx={{ opacity: 0.5 }}
    >
      Не указано
    </Typography>
  );
};
