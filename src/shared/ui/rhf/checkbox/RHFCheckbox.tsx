import {
  Box,
  Checkbox,
  type CheckboxProps,
  FormControlLabel,
  Typography,
} from '@mui/material';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type RHFCheckboxProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string;
  props?: CheckboxProps;
  description?: string;
  labelColor?: string;
  control: Control<TFieldValues>;
};

export const RHFCheckbox = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  props,
  control,
  labelColor,
  description,
}: RHFCheckboxProps<TFieldValues, TName>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        disabled={field.disabled}
        sx={{ ml: 0 }}
        control={
          <Checkbox
            {...field}
            {...props}
            sx={{ p: 0, mr: 1 }}
            checked={field.value}
            onChange={e => field.onChange(e.target.checked)}
          />
        }
        label={
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
            <Typography
              variant="body1"
              color={labelColor}
            >
              {label}
            </Typography>
            <Typography
              color="textDisabled"
              variant="caption"
            >
              {description}
            </Typography>
          </Box>
        }
      />
    )}
  />
);
