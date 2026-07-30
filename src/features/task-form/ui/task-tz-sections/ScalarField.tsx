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

export const ScalarField = ({ field, isEdit, value }: ScalarFieldProps) => {
  const { control } = useFormContext<TaskFormType>();

  if (field.type === 'boolean') {
    if (!isEdit) {
      if (!value) return null;

      return (
        <Typography variant="body2">
          {formatBooleanValue(Boolean(value))}
        </Typography>
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
          <Typography
            variant="caption"
            sx={{
              color: 'info.main',
              fontWeight: 500,
              display: 'block',
              mb: 0.25,
            }}
          >
            {field.label}
          </Typography>

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
      <Typography
        variant="body2"
        sx={{ whiteSpace: 'pre-wrap', width: '50%' }}
      >
        {stringValue}
      </Typography>
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
