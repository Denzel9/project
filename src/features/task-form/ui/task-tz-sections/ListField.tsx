import { Add, DeleteOutlined } from '@mui/icons-material';
import { Button, IconButton, Link, Stack, Typography } from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { RHFInput } from '@/shared';

import type { TaskFormType } from '../../model/schema/schema';
import type { TaskTzListField } from '../../model/taskTzFields';

type ListFieldProps = {
  field: TaskTzListField;
  isEdit: boolean;
};

export const ListField = ({ field, isEdit }: ListFieldProps) => {
  const { control } = useFormContext<TaskFormType>();

  const items = useWatch({ control, name: field.key });

  const { fields, append, remove } = useFieldArray({
    control,
    name: field.key,
  });

  const filledItems = items?.filter(item => item.value?.trim()) ?? [];

  if (!isEdit && !filledItems.length) {
    return null;
  }

  if (!isEdit) {
    return (
      <Stack
        spacing={1}
        sx={{ width: '50%' }}
      >
        {filledItems.map(item => {
          const value = item.value?.trim() ?? '';

          if (field.key === 'referenceItems' && /^https?:\/\//i.test(value)) {
            return (
              <Link
                key={value}
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
              >
                {value}
              </Link>
            );
          }

          return (
            <Typography
              key={value}
              variant="body2"
            >
              {value}
            </Typography>
          );
        })}
      </Stack>
    );
  }

  return (
    <Stack
      spacing={1}
      sx={{ width: '50%' }}
    >
      {fields.map((item, index) => (
        <Stack
          key={item.id}
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <RHFInput
            name={`${field.key}.${index}.value`}
            control={control}
            props={{
              placeholder: field.itemLabel,
              fullWidth: true,
            }}
          />
          <IconButton
            size="small"
            aria-label={`Удалить ${field.itemLabel.toLowerCase()}`}
            onClick={() => remove(index)}
            sx={{ mt: 0.5 }}
          >
            <DeleteOutlined fontSize="small" />
          </IconButton>
        </Stack>
      ))}

      <Button
        size="small"
        variant="outlined"
        startIcon={<Add />}
        onClick={() => append({ value: '' })}
        sx={{ alignSelf: 'flex-start' }}
      >
        Добавить {field.itemLabel.toLowerCase()}
      </Button>
    </Stack>
  );
};
