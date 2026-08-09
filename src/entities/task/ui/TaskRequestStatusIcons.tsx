import { EventBusy, EventRepeat } from '@mui/icons-material';
import { Stack, Tooltip, type StackProps } from '@mui/material';

import {
  getTaskAnnulmentRequest,
  getTaskDeadlineRequest,
  TASK_ANNULMENT_REQUEST_TITLE,
  TASK_DEADLINE_REQUEST_TITLE,
  TASK_REQUEST_STATUS_COLOR,
} from '../model/requestStatus';
import type { Task } from '../model/types';

type TaskRequestStatusIconsProps = {
  task: Pick<
    Task,
    'annulment' | 'annulments' | 'deadlineExtension' | 'deadlineExtensions'
  >;
  fontSize?: number;
  spacing?: StackProps['spacing'];
};

export const TaskRequestStatusIcons = ({
  task,
  fontSize = 18,
  spacing = 1,
}: TaskRequestStatusIconsProps) => {
  const deadlineRequest = getTaskDeadlineRequest(task);
  const annulmentRequest = getTaskAnnulmentRequest(task);

  if (!deadlineRequest && !annulmentRequest) return null;

  return (
    <Stack direction="row" spacing={spacing} sx={{ alignItems: 'center' }}>
      {deadlineRequest && (
        <Tooltip title={TASK_DEADLINE_REQUEST_TITLE[deadlineRequest.status]}>
          <EventRepeat
            sx={{
              fontSize,
              flexShrink: 0,
              color: TASK_REQUEST_STATUS_COLOR[deadlineRequest.status],
            }}
          />
        </Tooltip>
      )}

      {annulmentRequest && (
        <Tooltip title={TASK_ANNULMENT_REQUEST_TITLE[annulmentRequest.status]}>
          <EventBusy
            sx={{
              fontSize,
              flexShrink: 0,
              color: TASK_REQUEST_STATUS_COLOR[annulmentRequest.status],
            }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};
