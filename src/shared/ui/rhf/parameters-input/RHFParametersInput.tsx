import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { ParametersInput } from '@/shared/ui/parameters-input/ui/ParametersInput';

type RHFParametersInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  label: string;
  control: Control<TFieldValues>;
};

export const RHFParametersInput = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  control,
}: RHFParametersInputProps<TFieldValues, TName>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <ParametersInput
          label={label}
          value={field.value ?? ''}
          onChange={field.onChange}
          error={Boolean(fieldState.error)}
          helperText={fieldState.error?.message}
        />
      )}
    />
  );
};
