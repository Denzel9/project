import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  Box,
  FormControlLabel,
  IconButton,
  Switch,
  type SwitchProps,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type RHFSwitchProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string;
  props?: SwitchProps;
  description?: string;
  control: Control<TFieldValues>;
};

export const RHFSwitch = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  props,
  control,
  description,
}: RHFSwitchProps<TFieldValues, TName>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormControlLabel
        disabled={field.disabled}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          pointerEvents: 'none',
          ...props?.sx,
        }}
        role="none"
        control={
          <Switch
            {...field}
            {...props}
            sx={{ pointerEvents: 'auto' }}
            onChange={field.onChange}
          />
        }
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1">{label}</Typography>

            {description && (
              <Tooltip title={description}>
                <Box>
                  <IconButton
                    size="large"
                    sx={{ pointerEvents: 'auto' }}
                  >
                    <QuestionMarkIcon
                      color="disabled"
                      sx={{ width: 16, height: 16 }}
                    />
                  </IconButton>
                </Box>
              </Tooltip>
            )}
          </Box>
        }
      />
    )}
  />
);
