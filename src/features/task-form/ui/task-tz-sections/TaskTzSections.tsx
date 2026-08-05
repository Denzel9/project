import { useFormContext, useWatch } from 'react-hook-form';

import { TASK_TZ_GROUPS } from '../../model/taskTzFields';

import { TaskTzDescription } from './TaskTzDescription';
import { TaskTzGroupCard } from './TaskTzGroupCard';

import type { TaskFormType } from '../../model/schema/schema';

type TaskTzSectionsProps = {
  isEdit: boolean;
  canEdit: boolean;
  onEdit: () => void;
};

export const TaskTzSections = ({
  isEdit,
  canEdit,
  onEdit,
}: TaskTzSectionsProps) => {
  const { control } = useFormContext<TaskFormType>();

  const values = useWatch({ control }) as TaskFormType;

  return (
    <>
      <TaskTzDescription
        isEdit={isEdit}
        canEdit={canEdit}
        onEdit={onEdit}
        description={values.description}
      />

      {TASK_TZ_GROUPS.map(group => (
        <TaskTzGroupCard
          group={group}
          isEdit={isEdit}
          values={values}
          key={group.header}
        />
      ))}
    </>
  );
};
