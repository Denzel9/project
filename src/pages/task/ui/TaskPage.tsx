import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import {
  canEditTaskFields,
  canEditTaskStatus,
  useTaskByIdQuery,
  useUpdateTaskMutation,
  type TaskStatus,
  type UpdateTaskDto,
} from '@/entities/task';
import { TASK_STATUS_ENUM } from '@/entities/task/model/types';
import Gallery from '@/features/application-form/ui/Gallery';
import { useAuthStore } from '@/features/auth';
import { Media, PageLayout } from '@/widgets';

import { TaskComments } from './TaskComments';

import type { Photo } from '@/entities/photo';

export const TaskPage = () => {
  const { id } = useParams<{ id: string }>();
  const currentUserId = useAuthStore(state => state.id);

  const { data: task, isLoading } = useTaskByIdQuery(id ?? null);
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTaskMutation();

  const [status, setStatus] = useState<TaskStatus>('PREPARING');
  const [description, setDescription] = useState('');
  const [photoCount, setPhotoCount] = useState('');
  const [videoCount, setVideoCount] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [finalDate, setFinalDate] = useState<Dayjs | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<Photo[]>([]);

  const isOwner = task ? canEditTaskFields(task, currentUserId) : false;
  const canChangeStatus = task ? canEditTaskStatus(task, currentUserId) : false;

  useEffect(() => {
    if (!task) return;

    setTimeout(() => {
      setStatus(task.status);
      setDescription(task.description);
      setPhotoCount(task.photoCount);
      setVideoCount(task.videoCount);
      setUrgent(task.urgent);
      setFinalDate(task.finalDate ? dayjs(task.finalDate) : null);
    }, 0);
  }, [task]);

  const getStatus = (status: TaskStatus) => {
    switch (status) {
      case TASK_STATUS_ENUM.PREPARING:
        return TASK_STATUS_ENUM.PENDING_APPROVAL;
      case TASK_STATUS_ENUM.PENDING_APPROVAL:
        return TASK_STATUS_ENUM.IN_PROGRESS;
      case TASK_STATUS_ENUM.IN_PROGRESS:
        return TASK_STATUS_ENUM.COMPLETED;
    }
  };

  const handleSave = () => {
    if (!task) return;

    const body: UpdateTaskDto = isOwner
      ? {
          status: getStatus(status),
          description,
          photoCount,
          videoCount,
          urgent,
          finalDate: finalDate ? finalDate.toISOString() : null,
        }
      : { status };

    updateTask({ id: task.id, body });
  };

  const mediaItems =
    task?.media.map(url => ({
      url,
      mimeType: url.match(/\.(mp4|webm|mov)$/i) ? 'video/mp4' : 'image/jpeg',
    })) ?? [];

  return (
    <PageLayout title="Задача">
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && !task && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', py: 6 }}
        >
          Задача не найдена
        </Typography>
      )}

      {task && (
        <Box
          sx={{
            gap: 3,
            bgcolor: 'white',
            display: 'flex',
            p: { xs: 3, md: 4 },
            flexDirection: 'column',
            borderRadius: '32px',
          }}
        >
          <Stepper
            sx={{ mt: 4 }}
            activeStep={0}
            alternativeLabel
            orientation="horizontal"
          >
            <Step active={status === TASK_STATUS_ENUM.PREPARING}>
              <StepLabel>На подготовке</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.PENDING_APPROVAL}>
              <StepLabel>На согласовании</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.REVISION}>
              <StepLabel>На доработке</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.IN_PROGRESS}>
              <StepLabel>В работе</StepLabel>
            </Step>
            <Step active={status === TASK_STATUS_ENUM.COMPLETED}>
              <StepLabel>Исполнено</StepLabel>
            </Step>
          </Stepper>

          <Box sx={{ mt: 6 }}>
            <Gallery
              files={files}
              images={images}
              setFiles={setFiles}
              setImages={setImages}
              setDeletedFiles={() => {}}
            />
          </Box>

          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={3}
            sx={{ width: '50%' }}
          >
            {mediaItems.length > 0 && (
              <Box
                sx={{
                  width: { xs: '100%', lg: 400 },
                  height: { xs: 300, lg: 400 },
                  flexShrink: 0,
                }}
              >
                <Media items={mediaItems} />
              </Box>
            )}

            <Box sx={{ flex: 1 }}>
              <Stack spacing={4}>
                <TextField
                  fullWidth
                  multiline
                  minRows={6}
                  label="Описание"
                  disabled={!isOwner}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />

                <TextField
                  label="Кол-во фото"
                  sx={{ width: '50%' }}
                  value={photoCount}
                  disabled={!isOwner}
                  onChange={e => setPhotoCount(e.target.value)}
                />

                <TextField
                  label="Кол-во видео"
                  sx={{ width: '50%' }}
                  value={videoCount}
                  disabled={!isOwner}
                  onChange={e => setVideoCount(e.target.value)}
                />

                <DateTimePicker
                  label="Дедлайн"
                  value={finalDate}
                  disabled={!isOwner}
                  onChange={value => setFinalDate(value)}
                  sx={{
                    width: '50%',
                    '& .MuiPickersOutlinedInput-root': {
                      borderRadius: '16px',
                      '&:hover .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: BASE_COLOR,
                      },
                      '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
                        borderColor: BASE_COLOR,
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiDatePicker-inputLabel.Mui-focused': {
                      color: BASE_COLOR,
                    },
                  }}
                />
              </Stack>

              {!isOwner && (
                <Typography
                  variant="body1"
                  sx={{ mt: 3, whiteSpace: 'pre-wrap' }}
                >
                  {task.description}
                </Typography>
              )}

              {canChangeStatus && (
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    disabled={isUpdating}
                    onClick={handleSave}
                  >
                    На согласование
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    disabled={isUpdating}
                    onClick={handleSave}
                  >
                    На доработку
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>

          {task?.comments && task?.comments.length > 0 && (
            <>
              <Divider />
              <TaskComments task={task} />
            </>
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default TaskPage;
