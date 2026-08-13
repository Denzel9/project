import { Box, Link, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';

import { RHFInput, RHFSwitch } from '@/shared';

import {
  formatBooleanValue,
  type TaskTzScalarField,
} from '../../model/taskTzFields';

import type { TaskFormType } from '../../model/schema/schema';

type ScalarFieldProps = {
  field: TaskTzScalarField;
  isEdit: boolean;
  value: string | boolean;
};

const FieldLabel = ({ label }: { label: string }) => (
  <Typography
    variant="caption"
    sx={{
      color: 'info.main',
      fontWeight: 500,
      display: 'block',
      mb: 0.25,
    }}
  >
    {label}
  </Typography>
);

export const ScalarField = ({ field, isEdit, value }: ScalarFieldProps) => {
  const { control } = useFormContext<TaskFormType>();

  if (field.type === 'boolean') {
    if (!isEdit) {
      if (!value) return null;

      return (
        <Box sx={{ width: '50%' }}>
          <FieldLabel label={field.label} />
          <Typography variant="body2">
            {formatBooleanValue(Boolean(value))}
          </Typography>
        </Box>
      );
    }

    return (
      <RHFSwitch
        name={field.key}
        label={field.label}
        control={control}
      />
    );
  }

  const stringValue = typeof value === 'string' ? value : '';

  if (!isEdit) {
    if (!stringValue.trim()) return null;

    if (
      field.key === 'brandGuidelinesUrl' &&
      /^https?:\/\//i.test(stringValue.trim())
    ) {
      return (
        <Box sx={{ width: '50%' }}>
          <FieldLabel label={field.label} />
          <Link
            href={stringValue.trim()}
            target="_blank"
            rel="noopener noreferrer"
            variant="body2"
          >
            {stringValue.trim()}
          </Link>
        </Box>
      );
    }

    return (
      <Box sx={{ width: '50%' }}>
        <FieldLabel label={field.label} />
        <Typography
          variant="body2"
          sx={{ whiteSpace: 'pre-wrap' }}
        >
          {stringValue}
        </Typography>
      </Box>
    );
  }

  return (
    <RHFInput
      name={field.key}
      control={control}
      props={{
        placeholder: field.label,
        sx: { width: '50%' },
        multiline: field.multiline,
        minRows: field.multiline ? 3 : undefined,
      }}
    />
  );
};
