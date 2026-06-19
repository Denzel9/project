import {
  type Control,
  Controller,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { RichTextEditor } from './RichTextEditor';

type RHFRichTextEditorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
  control: Control<TFieldValues>;
  maxLength?: number;
  minHeight?: number;
  label?: string;
  disabled?: boolean;
};

export const RHFRichTextEditor = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  control,
  maxLength,
  minHeight,
  label,
  disabled,
}: RHFRichTextEditorProps<TFieldValues, TName>) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState }) => (
      <RichTextEditor
        value={field.value ?? ''}
        onChange={field.onChange}
        maxLength={maxLength}
        minHeight={minHeight}
        label={label}
        disabled={disabled || field.disabled}
        error={Boolean(fieldState.error)}
        helperText={fieldState.error?.message}
      />
    )}
  />
);

export default RHFRichTextEditor;
