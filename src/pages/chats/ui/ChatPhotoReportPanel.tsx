import { ArrowBack, CloudUploadOutlined } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { useState, type ChangeEvent } from 'react';

import {
  getIsCompanyAction,
  TASK_STATUS_ENUM,
  TASK_STATUS_LABELS,
  useUpdateTaskMutation,
  type Task,
} from '@/entities/task';
import { useTaskMediaSave } from '@/pages/task/model/hooks/useTaskMediaSave';
import { TaskResultDropzone } from '@/pages/task/ui/TaskResultDropzone';
import { hasPreparingMedia } from '@/shared/lib/media';
import { useSnackbarStore } from '@/widgets';

import { canUploadChatPhotoReport, getChatTaskLabel } from '../model/utils';

type ChatPhotoReportPanelProps = {
  tasks: Task[];
  currentUserId: string | null;
  onClose: () => void;
};

export const ChatPhotoReportPanel = ({
  tasks,
  currentUserId,
  onClose,
}: ChatPhotoReportPanelProps) => {
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const selectedTask = tasks.find(task => task.id === selectedTaskId) ?? null;
  const canEdit = selectedTask
    ? canUploadChatPhotoReport(selectedTask, currentUserId)
    : false;

  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: updateTask, isPending: isUpdatingStatus } =
    useUpdateTaskMutation();

  const {
    files,
    images,
    setFiles,
    setImages,
    handleSaveMedia,
    handleRemoveImage,
    handleCancel,
    handleRetryLocal,
    isPending,
  } = useTaskMediaSave({
    task: selectedTask ?? undefined,
    canEditMedia: canEdit,
    kind: 'report',
  });

  const isSaving = isPending || isUpdatingStatus;

  const handleTaskChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleCancel();
    setSelectedTaskId(event.target.value);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const handleSendToReview = async () => {
    if (!selectedTask || !canEdit || isSaving) return;
    if (hasPreparingMedia(images)) return;

    const hasUploadedMedia = images.some(
      image => !image.localId && !image.url.startsWith('blob:'),
    );
    const hasPendingFiles = files.length > 0;

    if (!hasUploadedMedia && !hasPendingFiles) {
      setSnackbarOpen?.(
        true,
        'Для проверки необходимо загрузить результат работы',
        'warning',
      );
      return;
    }

    try {
      if (hasPendingFiles) {
        const uploaded = await handleSaveMedia();

        if (!uploaded) {
          setSnackbarOpen?.(
            true,
            'Не удалось загрузить материалы. Попробуйте ещё раз',
            'error',
          );
          return;
        }
      }

      await updateTask({
        id: selectedTask.id,
        body: {
          status: TASK_STATUS_ENUM.CHECKING,
          isCompanyAction: getIsCompanyAction(
            selectedTask,
            false,
            TASK_STATUS_ENUM.CHECKING,
          ),
        },
      });

      setSnackbarOpen?.(true, 'Результаты отправлены на проверку');
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSnackbarOpen?.(true, String(error.response?.data?.message));
        return;
      }

      setSnackbarOpen?.(
        true,
        'Не удалось отправить на проверку. Попробуйте позже',
        'error',
      );
    }
  };

  return (
    <Stack
      sx={{
        p: 2,
        gap: 2,
        flex: 1,
        minHeight: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '24px',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton onClick={handleClose}>
            <ArrowBack />
          </IconButton>

          <Typography variant="h6">Результаты работы</Typography>
        </Stack>

        <TextField
          select
          size="small"
          label="Задача"
          value={selectedTaskId}
          onChange={handleTaskChange}
          sx={{
            width: { xs: '100%', md: '40%' },
          }}
        >
          {tasks.map(task => (
            <MenuItem
              key={task.id}
              value={task.id}
            >
              {getChatTaskLabel(task)} · {TASK_STATUS_LABELS[task.status]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
        }}
      >
        {selectedTask ? (
          <TaskResultDropzone
            status={selectedTask.status}
            files={files}
            images={images}
            deadline={selectedTask.finalDate}
            setFiles={setFiles}
            setImages={setImages}
            isSaving={isSaving}
            canUpload={canEdit}
            saveLabel="На проверку"
            showSaveWhenReady
            onSave={() => void handleSendToReview()}
            onCancel={handleCancel}
            onRetryLocal={handleRetryLocal}
            onRemoveUploaded={handleRemoveImage}
            postTitle={selectedTask.post?.title}
            postId={selectedTask.postId ?? selectedTask.post?.id}
            deliverables={selectedTask.deliverables}
          />
        ) : (
          <Box
            sx={{
              py: 5,
              px: 2,
              textAlign: 'center',
              borderRadius: '24px',
              border: '2px dashed',
              borderColor: 'action.disabled',
              bgcolor: 'action.hover',
              opacity: 0.72,
            }}
          >
            <CloudUploadOutlined
              sx={{
                fontSize: 40,
                mb: 1,
                color: 'text.disabled',
              }}
            />

            <Typography
              variant="body1"
              sx={{ fontWeight: 500 }}
            >
              Сначала выберите задачу
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              После выбора задачи можно будет загрузить материалы
            </Typography>
          </Box>
        )}
      </Box>
    </Stack>
  );
};
