import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, Button } from '@mui/material';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { mapTaskToForm } from '../model/mappers';
import {
  defaultValues,
  schema,
  schemaKeys,
  type TaskFormType,
} from '../model/schema/schema';

import { TaskFormFields } from './TaskFormFields';

import type { Task } from '@/entities/task';

type TaskFormProps = {
  task: Task;
  isOwner: boolean;
  onSubmit: (values: TaskFormType) => void;
  canChangeStatus?: boolean;
};

export const TaskForm = ({
  task,
  isOwner,
  onSubmit,
  canChangeStatus = false,
}: TaskFormProps) => {
  const methods = useForm<TaskFormType>({
    defaultValues,
    mode: 'onSubmit',
    resolver: yupResolver(schema),
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    const formValues = mapTaskToForm(task);

    schemaKeys.forEach(key => {
      if (formValues[key] !== undefined) {
        setValue(key, formValues[key] as TaskFormType[typeof key]);
      }
    });
  }, [task, setValue]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TaskFormFields isOwner={isOwner} />
        {canChangeStatus && (
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 3 }}
          >
            <Button
              size="small"
              type="submit"
              variant="contained"
            >
              На согласование
            </Button>

            <Button
              size="small"
              type="submit"
              variant="outlined"
              color="error"
            >
              На доработку
            </Button>
          </Stack>
        )}
      </form>
    </FormProvider>
  );
};
