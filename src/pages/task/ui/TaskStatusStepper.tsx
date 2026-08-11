import { Box, Step, StepLabel, Stepper } from '@mui/material';

import {
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  type TaskStatus,
} from '@/entities';

const TASK_FLOW_STEPS = [
  TASK_STATUS_ENUM.PREPARING,
  TASK_STATUS_ENUM.PENDING_APPROVAL,
  TASK_STATUS_ENUM.REVISION,
  TASK_STATUS_ENUM.IN_PROGRESS,
  TASK_STATUS_ENUM.CHECKING,
  TASK_STATUS_ENUM.COMPLETED,
] as const;

const getActiveStepIndex = (status: TaskStatus) => {
  const index = TASK_FLOW_STEPS.indexOf(
    status as (typeof TASK_FLOW_STEPS)[number]
  );

  return index === -1 ? 0 : index;
};

type TaskStatusStepperProps = {
  status: TaskStatus;
};

export const TaskStatusStepper = ({ status }: TaskStatusStepperProps) => {
  const activeStep = getActiveStepIndex(status);

  return (
    <Box
      sx={{
        mb: 1,
        bgcolor: 'white',
        border: '1px solid',
        borderRadius: '32px',
        borderColor: 'divider',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        overflowX: { xs: 'auto', md: 'visible' },
      }}
    >
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        sx={{
          py: 4,
          px: 2,
          minWidth: { xs: 640, md: 0 },
          '& .MuiStepLabel-label': {
            mt: 1,
            fontSize: { xs: '0.7rem', sm: '0.8rem' },
          },
        }}
      >
        {TASK_FLOW_STEPS.map((stepStatus, index) => (
          <Step
            key={stepStatus}
            completed={activeStep > index}
            active={status === stepStatus}
          >
            <StepLabel>{TASK_STATUS_LABELS[stepStatus]}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
