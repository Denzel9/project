import { Box, Button, Stack, Typography } from '@mui/material';

import { ChatInput } from '@/shared';

import { useTaskCommentComposer } from '../model/useTaskCommentComposer';

type TaskCommentComposerProps = {
  taskId: string;
  executorId?: string | null;
  isExecutorApprove?: boolean;
  placeholder?: string;
  showCancel?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export const TaskCommentComposer = ({
  taskId,
  executorId,
  isExecutorApprove,
  placeholder = 'Написать комментарий…',
  showCancel = false,
  onSuccess,
  onCancel,
}: TaskCommentComposerProps) => {
  const {
    content,
    setContent,
    pendingFiles,
    addPendingFiles,
    removePendingFile,
    send,
    isSending,
    error,
  } = useTaskCommentComposer(taskId);

  const handleSend = async () => {
    const success = await send();

    if (success) {
      onSuccess?.();
    }
  };

  return (
    <Box>
      {error && (
        <Typography
          color="error"
          variant="body2"
          sx={{ mb: 1 }}
        >
          {error}
        </Typography>
      )}

      <ChatInput
        value={content}
        onChange={setContent}
        isSending={isSending}
        executorId={executorId ?? undefined}
        pendingFiles={pendingFiles}
        onAttachFiles={addPendingFiles}
        onRemoveFile={removePendingFile}
        placeholder={placeholder}
        onSend={() => void handleSend()}
        isExecutorApprove={isExecutorApprove}
      />

      {showCancel && onCancel && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, justifyContent: 'flex-end' }}
        >
          <Button
            size="small"
            onClick={onCancel}
          >
            Отмена
          </Button>
        </Stack>
      )}
    </Box>
  );
};
