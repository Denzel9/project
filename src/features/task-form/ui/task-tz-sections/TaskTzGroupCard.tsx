import { Box, Stack, Typography } from '@mui/material';

import { groupHasValue } from '../../model/taskTzFields';
import { TaskDeliverablesSection } from '../TaskDeliverablesSection';

import { ListField } from './ListField';
import { ScalarField } from './ScalarField';

import type { TaskFormType } from '../../model/schema/schema';
import type { TaskTzGroup } from '../../model/taskTzFields';

type TaskTzGroupCardProps = {
  group: TaskTzGroup;
  isEdit: boolean;
  values: TaskFormType;
};

export const TaskTzGroupCard = ({
  group,
  isEdit,
  values,
}: TaskTzGroupCardProps) => {
  const hasValue = groupHasValue(group, values);
  const isListOnlyGroup =
    Boolean(group.listFields?.length) &&
    !group.scalarFields?.length &&
    group.type !== 'deliverables';

  if (!isEdit && !hasValue) {
    return null;
  }

  if (isListOnlyGroup) {
    return (
      <Box sx={{ py: 2 }}>
        <Stack spacing={isEdit ? 2 : 1.5}>
          {group.listFields?.map(field => (
            <ListField
              field={field}
              key={field.key}
              isEdit={isEdit}
              title={group.title}
            />
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 600, mb: 1 }}
      >
        {group.title}
      </Typography>

      <Stack spacing={isEdit ? 2 : 1.5}>
        {group.type === 'deliverables' && (
          <TaskDeliverablesSection isEdit={isEdit} />
        )}

        {group.scalarFields?.map(field => (
          <ScalarField
            field={field}
            key={field.key}
            isEdit={isEdit}
            value={values[field.key]}
          />
        ))}

        {group.listFields?.map(field => (
          <ListField
            field={field}
            key={field.key}
            isEdit={isEdit}
          />
        ))}
      </Stack>
    </Box>
  );
};
