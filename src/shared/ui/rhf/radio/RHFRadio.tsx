import {
  Box,
  FormControlLabel,
  Radio,
  type RadioProps,
  Typography,
} from '@mui/material';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type RHFRadioProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string;
  props?: RadioProps;
  description?: string;
  control: Control<TFieldValues>;
};

export const RHFRadio = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  props,
  control,
  description,
}: RHFRadioProps<TFieldValues, TName>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        disabled={field.disabled}
        sx={{ display: 'flex', alignItems: 'start', justifyContent: 'start' }}
        control={
          <Radio
            {...field}
            {...props}
            checked={field.value === props?.value}
            onChange={() => field.onChange(props?.value)}
          />
        }
        label={
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body1">{label}</Typography>
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
