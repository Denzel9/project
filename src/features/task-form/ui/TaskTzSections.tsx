import { Add, DeleteOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import {
  MarkdownContent,
  RHFInput,
  RHFRichTextEditor,
  RHFSwitch,
} from '@/shared';

import { hasDeliverableValues } from '../model/deliverablesMappers';
import {
  TASK_TZ_GROUPS,
  type TaskTzGroup,
  type TaskTzListField,
  type TaskTzScalarField,
} from '../model/taskTzFields';

import { TaskDeliverablesSection } from './TaskDeliverablesSection';

import type { TaskFormType } from '../model/schema/schema';

type TaskTzSectionsProps = {
  isMe: boolean;
  isEdit: boolean;
  onEdit: () => void;
};

const isEmptyValue = (value: unknown) => {
  if (typeof value === 'boolean') return !value;
  if (typeof value === 'string') return !value.trim();
  if (Array.isArray(value)) {
    return !value.some(item => {
      if (typeof item === 'object' && item && 'value' in item) {
        return Boolean((item as { value?: string }).value?.trim());
      }

      return false;
    });
  }

  return true;
};

const groupHasValue = (group: TaskTzGroup, values: TaskFormType) => {
  if (group.type === 'deliverables') {
    return hasDeliverableValues(values.deliverables);
  }

  const scalarFilled = group.scalarFields?.some(
    field => !isEmptyValue(values[field.key])
  );
  const listFilled = group.listFields?.some(field => {
    const items = values[field.key] as { value?: string }[] | undefined;
    return items?.some(item => item.value?.trim());
  });

  return Boolean(scalarFilled || listFilled);
};

const formatBooleanValue = (value: boolean) => (value ? 'Да' : 'Нет');

type ScalarFieldProps = {
  field: TaskTzScalarField;
  isEdit: boolean;
  value: string | boolean;
};

const ScalarField = ({ field, isEdit, value }: ScalarFieldProps) => {
  const { control } = useFormContext<TaskFormType>();

  if (field.type === 'boolean') {
    if (!isEdit) {
      if (!value) return null;

      return (
        <Box>
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
        <Box>
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
      <Box>
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
        fullWidth: true,
        multiline: field.multiline,
        minRows: field.multiline ? 3 : undefined,
      }}
    />
  );
};

type ListFieldProps = {
  field: TaskTzListField;
  isEdit: boolean;
};

const ListField = ({ field, isEdit }: ListFieldProps) => {
  const { control } = useFormContext<TaskFormType>();
  const items = useWatch({ control, name: field.key }) as
    | { value?: string }[]
    | undefined;
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
      <Stack spacing={1}>
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
    <Stack spacing={1}>
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

type TaskTzGroupCardProps = {
  group: TaskTzGroup;
  isEdit: boolean;
  values: TaskFormType;
};

const TaskTzGroupCard = ({ group, isEdit, values }: TaskTzGroupCardProps) => {
  const hasValue = groupHasValue(group, values);

  if (!isEdit && !hasValue) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '16px',
        bgcolor: 'secondary.light',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mb: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600 }}
        >
          {group.title}
        </Typography>
      </Stack>

      <Stack spacing={isEdit ? 2 : 1.5}>
        {group.type === 'deliverables' ? (
          <TaskDeliverablesSection isEdit={isEdit} />
        ) : null}

        {group.scalarFields?.map(field => (
          <ScalarField
            key={field.key}
            field={field}
            isEdit={isEdit}
            value={values[field.key] as string | boolean}
          />
        ))}

        {group.listFields?.map(field => (
          <ListField
            key={field.key}
            field={field}
            isEdit={isEdit}
          />
        ))}
      </Stack>
    </Box>
  );
};

export const TaskTzSections = ({
  isMe,
  isEdit,
  onEdit,
}: TaskTzSectionsProps) => {
  const { control } = useFormContext<TaskFormType>();
  const values = useWatch({ control }) as TaskFormType;

  const showDescription = isEdit || Boolean(values.description?.trim()) || isMe;

  return (
    <Stack spacing={2}>
      {showDescription && (
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            bgcolor: 'secondary.light',
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            sx={{
              mb: 1.5,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600 }}
            >
              Описание
            </Typography>
          </Stack>

          {isEdit ? (
            <RHFRichTextEditor
              control={control}
              name="description"
              maxLength={10000}
              minHeight={200}
            />
          ) : values.description?.trim() ? (
            <MarkdownContent content={values.description} />
          ) : (
            <Typography
              onClick={onEdit}
              sx={{
                color: 'info.main',
                fontWeight: 500,
                cursor: isMe ? 'pointer' : 'default',
                ':hover': isMe ? { color: 'primary.main' } : {},
              }}
            >
              {isMe ? 'Добавить' : '—'}
            </Typography>
          )}
        </Box>
      )}

      {TASK_TZ_GROUPS.map(group => (
        <TaskTzGroupCard
          key={group.header}
          group={group}
          isEdit={isEdit}
          values={values}
        />
      ))}
    </Stack>
  );
};
