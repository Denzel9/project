import { ArrowBack, Close, CloudUploadOutlined } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';

import { theme } from '@/app/index';
import {
  TASK_STATUS_LABELS,
  useUploadTaskMediaMutation,
  type Task,
} from '@/entities/task';
import { validateMediaFile } from '@/shared/lib/media';
import { useSnackbarStore } from '@/widgets';

import { canUploadChatPhotoReport, getChatTaskLabel } from '../model/utils';

const ACCEPT = 'image/*,video/*';

type ChatPhotoReportPanelProps = {
  tasks: Task[];
  currentUserId: string | null;
  onClose: () => void;
};

type PendingPreview = {
  id: string;
  file: File;
  url: string;
};

export const ChatPhotoReportPanel = ({
  tasks,
  currentUserId,
  onClose,
}: ChatPhotoReportPanelProps) => {
  const { setSnackbarOpen } = useSnackbarStore();
  const { mutateAsync: uploadMedia, isPending: isUploading } =
    useUploadTaskMediaMutation();

  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [pendingFiles, setPendingFiles] = useState<PendingPreview[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const selectedTask = tasks.find(task => task.id === selectedTaskId) ?? null;
  const isDropzoneEnabled = Boolean(selectedTaskId);
  const canSend =
    Boolean(selectedTaskId) && pendingFiles.length > 0 && !isUploading;

  const revokePreview = useCallback((preview: PendingPreview) => {
    URL.revokeObjectURL(preview.url);
  }, []);

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!isDropzoneEnabled || !incoming.length) {
        return;
      }

      const validFiles: File[] = [];

      for (const file of incoming) {
        const validationError = validateMediaFile(file);

        if (validationError) {
          setSnackbarOpen(true, validationError, 'error');
          continue;
        }

        validFiles.push(file);
      }

      if (!validFiles.length) {
        return;
      }

      setPendingFiles(prev => [
        ...prev,
        ...validFiles.map(file => ({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
          file,
          url: URL.createObjectURL(file),
        })),
      ]);
    },
    [isDropzoneEnabled, setSnackbarOpen]
  );

  const handleTaskChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedTaskId(event.target.value);
    setPendingFiles(prev => {
      prev.forEach(revokePreview);
      return [];
    });
  };

  const handleRemoveFile = (id: string) => {
    setPendingFiles(prev => {
      const target = prev.find(item => item.id === id);

      if (target) {
        revokePreview(target);
      }

      return prev.filter(item => item.id !== id);
    });
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!isDropzoneEnabled || isUploading) {
      return;
    }

    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounterRef.current -= 1;

    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    if (!isDropzoneEnabled || isUploading) {
      return;
    }

    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = '';
  };

  const handleSend = async () => {
    if (!selectedTask || !pendingFiles.length) {
      return;
    }

    if (!canUploadChatPhotoReport(selectedTask, currentUserId)) {
      setSnackbarOpen(
        true,
        'Фотоотчёт можно добавить только к задаче в статусе «В работе»',
        'warning'
      );
      return;
    }

    try {
      await uploadMedia({
        taskId: selectedTask.id,
        files: pendingFiles.map(item => item.file),
        kind: 'report',
      });

      pendingFiles.forEach(revokePreview);
      setPendingFiles([]);
      setSelectedTaskId('');
      setSnackbarOpen(true, 'Фотоотчёт добавлен в задачу', 'success');
      onClose();
    } catch {
      setSnackbarOpen(true, 'Не удалось отправить фотоотчёт', 'error');
    }
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
        bgcolor: 'common.white',
        p: { xs: 2, md: 4 },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center' }}
        >
          <IconButton onClick={onClose}>
            <ArrowBack />
          </IconButton>

          <Typography variant="h6">Добавить фотоотчёт</Typography>
        </Stack>
      </Stack>

      <TextField
        select
        label="Задача"
        value={selectedTaskId}
        onChange={handleTaskChange}
        sx={{
          width: '50%',
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
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        <Box
          role="button"
          tabIndex={isDropzoneEnabled ? 0 : -1}
          aria-disabled={!isDropzoneEnabled}
          onClick={() => {
            if (isDropzoneEnabled && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={event => {
            if (
              isDropzoneEnabled &&
              !isUploading &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            py: 5,
            px: 2,
            textAlign: 'center',
            borderRadius: '24px',
            border: '2px dashed',
            borderColor: isDropzoneEnabled
              ? isDragActive
                ? 'primary.main'
                : 'divider'
              : 'action.disabled',
            bgcolor: !isDropzoneEnabled
              ? 'action.hover'
              : isDragActive
                ? alpha(theme.palette.primary.main, 0.06)
                : 'secondary.light',
            cursor:
              isDropzoneEnabled && !isUploading ? 'pointer' : 'not-allowed',
            opacity: isDropzoneEnabled ? 1 : 0.72,
            transition: 'border-color 0.2s ease, background-color 0.2s ease',
          }}
        >
          <CloudUploadOutlined
            sx={{
              fontSize: 40,
              mb: 1,
              color: isDropzoneEnabled ? 'text.secondary' : 'text.disabled',
            }}
          />

          <Typography
            variant="body1"
            sx={{ fontWeight: 500 }}
          >
            {isDropzoneEnabled
              ? 'Перетащите фото или видео сюда'
              : 'Сначала выберите задачу'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {isDropzoneEnabled
              ? 'или нажмите, чтобы выбрать файлы'
              : 'После выбора задачи можно будет загрузить материалы'}
          </Typography>

          <input
            hidden
            multiple
            type="file"
            ref={fileInputRef}
            accept={ACCEPT}
            disabled={!isDropzoneEnabled || isUploading}
            onChange={handleFileChange}
          />
        </Box>

        {pendingFiles.length > 0 && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap' }}
          >
            {pendingFiles.map(item => (
              <Box
                key={item.id}
                sx={{
                  width: 96,
                  height: 96,
                  borderRadius: '16px',
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {item.file.type.startsWith('video/') ? (
                  <Box
                    component="video"
                    src={item.url}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    component="img"
                    src={item.url}
                    alt={item.file.name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}

                <IconButton
                  size="small"
                  aria-label="Удалить файл"
                  onClick={() => handleRemoveFile(item.id)}
                  sx={{
                    top: 4,
                    right: 4,
                    position: 'absolute',
                    bgcolor: 'rgba(0, 0, 0, 0.55)',
                    color: 'common.white',
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.75)',
                    },
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          disabled={isUploading}
        >
          Отмена
        </Button>

        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!canSend}
          startIcon={
            isUploading ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : undefined
          }
        >
          {isUploading ? 'Отправка…' : 'Отправить'}
        </Button>
      </Stack>
    </Stack>
  );
};
