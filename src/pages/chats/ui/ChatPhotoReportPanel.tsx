import { ArrowBack, CloudUploadOutlined } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState, type ChangeEvent } from 'react';

import {
  TASK_STATUS_LABELS,
  type Task,
} from '@/entities/task';
import { useTaskMediaSave } from '@/pages/task/model/hooks/useTaskMediaSave';
import { TaskResultDropzone } from '@/pages/task/ui/TaskResultDropzone';

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

  const handleTaskChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleCancel();
    setSelectedTaskId(event.target.value);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  return (
    <Stack
      sx={{
        gap: 2,
        flex: 1,
        minHeight: 0,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '32px',
        bgcolor: 'background.paper',
        p: { xs: 2, md: 4 },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center' }}
      >
        <IconButton onClick={handleClose}>
          <ArrowBack />
        </IconButton>

        <Typography variant="h6">Результаты работы</Typography>
      </Stack>

      <TextField
        select
        label="Задача"
        value={selectedTaskId}
        onChange={handleTaskChange}
        sx={{
          width: { xs: '100%', md: '50%' },
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
            isSaving={isPending}
            canUpload={canEdit}
            onSave={handleSaveMedia}
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
