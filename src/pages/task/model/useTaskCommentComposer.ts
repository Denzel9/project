import { useCallback, useState } from 'react';

import {
  uploadTaskCommentMediaBatch,
  useCreateTaskCommentMutation,
  validateChatMediaFile,
} from '@/entities';

import { COMMENT_MEDIA_PLACEHOLDER } from './lib/commentMedia';

export const useTaskCommentComposer = (taskId: string) => {
  const [content, setContent] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isSendingMedia, setIsSendingMedia] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { mutateAsync: createComment, isPending: isCreating } =
    useCreateTaskCommentMutation();

  const isSending = isCreating || isSendingMedia;

  const addPendingFiles = useCallback((files: File[]) => {
    const validFiles: File[] = [];

    for (const file of files) {
      const validationError = validateChatMediaFile(file);

      if (validationError) {
        setError(validationError);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) return;

    setPendingFiles(prev => [...prev, ...validFiles]);
    setError(null);
  }, []);

  const removePendingFile = useCallback((index: number) => {
    setPendingFiles(prev => prev.filter((_, fileIndex) => fileIndex !== index));
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setPendingFiles([]);
    setError(null);
  }, []);

  const send = useCallback(async (): Promise<boolean> => {
    const trimmed = content.trim();
    const hasContent = Boolean(trimmed);
    const hasFiles = pendingFiles.length > 0;

    if (!hasContent && !hasFiles) return false;

    try {
      setIsSendingMedia(true);
      setError(null);

      const media = hasFiles
        ? await uploadTaskCommentMediaBatch(taskId, pendingFiles)
        : undefined;

      await createComment({
        taskId,
        body: {
          content: hasContent ? trimmed : COMMENT_MEDIA_PLACEHOLDER,
          media,
        },
      });

      reset();
      return true;
    } catch {
      setError('Не удалось отправить комментарий');
      return false;
    } finally {
      setIsSendingMedia(false);
    }
  }, [content, createComment, pendingFiles, reset, taskId]);

  return {
    content,
    setContent,
    pendingFiles,
    addPendingFiles,
    removePendingFile,
    send,
    reset,
    isSending,
    error,
  };
};
