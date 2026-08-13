import {
  Add,
  DeleteOutlined,
  EditOutlined,
  MoreVert,
  PlayArrowOutlined,
  SendOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';

import {
  useCreateFileTemplateMutation,
  useCreateTaskTemplateMutation,
  useDeleteFileTemplateMutation,
  useDeletePostMutation,
  useDeleteTaskTemplateMutation,
  useFileTemplatesQuery,
  useInstantiateTaskTemplateMutation,
  usePostsQuery,
  useTaskTemplatesQuery,
  useUpdatePostMutation,
  useUpdateTaskTemplateMutation,
  type CreateTaskTemplateDto,
  type FileTemplate,
  type Post,
  type TaskTemplate,
} from '@/entities';
import {
  getEmailConfirmErrorMessage,
  useAuthStore,
  useRequireEmailConfirmed,
} from '@/features/auth';
import { EmptyBlock, ROUTES } from '@/shared';
import {
  MEDIA_FILE_TEMPLATE_ACCEPT,
  validateMediaFile,
} from '@/shared/lib/media';
import { ConfirmDialog, PageLayout, useSnackbarStore } from '@/widgets';

import { SendFileTemplateDialog } from './SendFileTemplateDialog';
import { TemplateFormDialog } from './TemplateFormDialog';
import { UseTemplateDialog } from './UseTemplateDialog';

const formatFileSize = (size?: string) => {
  const bytes = Number(size);

  if (!bytes || Number.isNaN(bytes)) return null;

  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const getFileKindLabel = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return 'Изображение';
  if (mimeType.startsWith('video/')) return 'Видео';
  if (mimeType === 'application/pdf') return 'PDF';
  if (mimeType.includes('word')) return 'Документ';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return 'Таблица';
  }

  return 'Файл';
};

const TemplateCard = ({
  template,
  onUse,
  onEdit,
  onDelete,
}: {
  template: TaskTemplate;
  onUse: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        height: '100%',
        bgcolor: 'white',
        border: '1px solid',
        borderRadius: '24px',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
            noWrap
          >
            {template.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {template.title?.trim() || 'Без названия задачи'}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={event => setMenuAnchor(event.currentTarget)}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Stack>

      {template.description?.trim() ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {template.description}
        </Typography>
      ) : null}

      <Stack
        direction="row"
        spacing={1}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        <Chip
          size="small"
          label={`Фото: ${template.photoCount}`}
        />
        <Chip
          size="small"
          label={`Видео: ${template.videoCount}`}
        />
        {template.urgent && (
          <Chip
            size="small"
            color="warning"
            label="Срочная"
          />
        )}
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        обновлён{' '}
        {formatDistanceToNow(new Date(template.updatedAt), {
          addSuffix: true,
          locale: ru,
        })}
      </Typography>

      <Button
        size="small"
        variant="contained"
        startIcon={<PlayArrowOutlined />}
        onClick={onUse}
        sx={{ alignSelf: 'flex-start', mt: 'auto' }}
      >
        Создать задачу
      </Button>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onEdit();
          }}
        >
          <EditOutlined
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Редактировать
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onDelete();
          }}
        >
          <DeleteOutlined
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Удалить
        </MenuItem>
      </Menu>
    </Stack>
  );
};

const PostTemplateCard = ({
  post,
  onPublish,
  onEdit,
  onDelete,
  isPublishing = false,
}: {
  post: Post;
  onPublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isPublishing?: boolean;
}) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        height: '100%',
        bgcolor: 'white',
        border: '1px solid',
        borderRadius: '24px',
        borderColor: 'divider',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
            noWrap
          >
            {post.title?.trim() || 'Без названия'}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={event => setMenuAnchor(event.currentTarget)}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Stack>

      {post.description?.trim() ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {post.description}
        </Typography>
      ) : null}

      <Typography
        variant="caption"
        color="text.secondary"
      >
        обновлён{' '}
        {formatDistanceToNow(new Date(post.updatedAt), {
          addSuffix: true,
          locale: ru,
        })}
      </Typography>

      <Button
        size="small"
        variant="contained"
        startIcon={<PlayArrowOutlined />}
        onClick={onPublish}
        loading={isPublishing}
        disabled={isPublishing}
        sx={{ alignSelf: 'flex-start', mt: 'auto' }}
      >
        Опубликовать
      </Button>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onEdit();
          }}
        >
          <EditOutlined
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Редактировать
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onDelete();
          }}
        >
          <DeleteOutlined
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Удалить
        </MenuItem>
      </Menu>
    </Stack>
  );
};

const FileTemplateCard = ({
  file,
  onDelete,
}: {
  file: FileTemplate;
  onDelete: () => void;
}) => {
  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [isSendOpen, setIsSendOpen] = useState(false);
  const sizeLabel = formatFileSize(file.size);

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        minWidth: 0,
        height: '100%',
        bgcolor: 'white',
        border: '1px solid',
        borderRadius: '24px',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Stack
        spacing={1}
        direction="row"
        sx={{
          minWidth: 0,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
            noWrap
          >
            {file.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
          >
            {[getFileKindLabel(file.mimeType), sizeLabel]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        </Box>

        <IconButton
          size="small"
          onClick={event => setMenuAnchor(event.currentTarget)}
          sx={{ flexShrink: 0 }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      </Stack>

      <Typography
        variant="caption"
        color="text.secondary"
      >
        загружен{' '}
        {formatDistanceToNow(new Date(file.createdAt), {
          addSuffix: true,
          locale: ru,
        })}
      </Typography>

      <Button
        size="small"
        variant="outlined"
        startIcon={<SendOutlined />}
        onClick={() => {
          if (!requireEmailConfirmed()) return;
          setIsSendOpen(true);
        }}
        sx={{ alignSelf: 'flex-start', mt: 'auto' }}
      >
        Отправить
      </Button>

      <SendFileTemplateDialog
        open={isSendOpen}
        file={file}
        onClose={() => setIsSendOpen(false)}
      />

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchor(null);
            onDelete();
          }}
        >
          <DeleteOutlined
            fontSize="small"
            sx={{ mr: 1 }}
          />
          Удалить
        </MenuItem>
      </Menu>
    </Stack>
  );
};

const TEMPLATE_TAB = {
  ANNOUNCEMENTS: 0,
  TASKS: 1,
  FILES: 2,
} as const;

export const TemplatesPage = () => {
  const navigate = useNavigate();
  const { id: userId } = useAuthStore();
  const { setSnackbarOpen } = useSnackbarStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const [tab, setTab] = useState<number>(TEMPLATE_TAB.ANNOUNCEMENTS);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, refetch } = useTaskTemplatesQuery();
  const {
    data: postTemplatesData,
    isLoading: isPostTemplatesLoading,
    isError: isPostTemplatesError,
    refetch: refetchPostTemplates,
  } = usePostsQuery(
    {
      ownerId: userId || '',
      isTemplate: true,
      limit: 100,
    },
    { enabled: Boolean(userId) }
  );
  const {
    data: fileTemplatesData,
    isLoading: isFileTemplatesLoading,
    isError: isFileTemplatesError,
    refetch: refetchFileTemplates,
  } = useFileTemplatesQuery();
  const { mutateAsync: createTemplate, isPending: isCreating } =
    useCreateTaskTemplateMutation();
  const { mutateAsync: updateTemplate, isPending: isUpdating } =
    useUpdateTaskTemplateMutation();
  const { mutateAsync: deleteTemplate, isPending: isDeleting } =
    useDeleteTaskTemplateMutation();
  const { mutateAsync: deletePostTemplate, isPending: isDeletingPost } =
    useDeletePostMutation();
  const { mutateAsync: updatePostTemplate, isPending: isPublishingPost } =
    useUpdatePostMutation();
  const { mutateAsync: createFileTemplate, isPending: isUploadingFile } =
    useCreateFileTemplateMutation();
  const { mutateAsync: deleteFileTemplate, isPending: isDeletingFile } =
    useDeleteFileTemplateMutation();
  const { mutateAsync: instantiateTemplate, isPending: isInstantiating } =
    useInstantiateTaskTemplateMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null
  );
  const [useTemplate, setUseTemplate] = useState<TaskTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskTemplate | null>(null);
  const [deletePostTarget, setDeletePostTarget] = useState<Post | null>(null);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [deleteFileTarget, setDeleteFileTarget] = useState<FileTemplate | null>(
    null
  );

  const templates = data ?? [];
  const postTemplates = postTemplatesData?.items ?? [];
  const fileTemplates = fileTemplatesData ?? [];
  const isTasksTab = tab === TEMPLATE_TAB.TASKS;
  const isAnnouncementsTab = tab === TEMPLATE_TAB.ANNOUNCEMENTS;
  const isFilesTab = tab === TEMPLATE_TAB.FILES;
  const isEmpty = isTasksTab && !isLoading && !isError && templates.length === 0;
  const isPostTemplatesEmpty =
    isAnnouncementsTab &&
    !isPostTemplatesLoading &&
    !isPostTemplatesError &&
    postTemplates.length === 0;
  const isFileTemplatesEmpty =
    isFilesTab &&
    !isFileTemplatesLoading &&
    !isFileTemplatesError &&
    fileTemplates.length === 0;

  const handleOpenCreate = () => {
    if (!requireEmailConfirmed()) return;

    if (isAnnouncementsTab) {
      navigate(`${ROUTES.MANAGE_APPLICATION}?asTemplate=1`);
      return;
    }

    if (isTasksTab) {
      setEditingTemplate(null);
      setIsFormOpen(true);
    }

    if (isFilesTab) {
      fileInputRef.current?.click();
    }
  };

  const handleUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';

    if (!selected.length) return;

    let uploaded = 0;

    for (const file of selected) {
      const validationError = validateMediaFile(file);

      if (validationError) {
        setSnackbarOpen(true, `${file.name}: ${validationError}`);
        continue;
      }

      try {
        await createFileTemplate(file);
        uploaded += 1;
      } catch (error) {
        setSnackbarOpen(
          true,
          getEmailConfirmErrorMessage(
            error,
            `Не удалось загрузить «${file.name}»`
          )
        );
      }
    }

    if (uploaded > 0) {
      setSnackbarOpen(
        true,
        uploaded === 1 ? 'Файл загружен' : `Загружено файлов: ${uploaded}`
      );
    }
  };

  const handleEditPostTemplate = (post: Post) => {
    if (!requireEmailConfirmed()) return;
    navigate(`${ROUTES.MANAGE_APPLICATION}?id=${post.id}&asTemplate=1`);
  };

  const handlePublishPostTemplate = async (post: Post) => {
    if (!requireEmailConfirmed()) return;

    try {
      setPublishingPostId(post.id);
      await updatePostTemplate({
        id: post.id,
        body: { isTemplate: false, isPrivate: false },
      });
      setSnackbarOpen(true, 'Объявление опубликовано');
      navigate(`${ROUTES.POST}/${post.id}`);
    } catch (error) {
      setSnackbarOpen(
        true,
        getEmailConfirmErrorMessage(error, 'Не удалось опубликовать объявление')
      );
    } finally {
      setPublishingPostId(null);
    }
  };

  const handleSubmitForm = async (values: CreateTaskTemplateDto) => {
    try {
      if (editingTemplate) {
        await updateTemplate({ id: editingTemplate.id, body: values });
        setSnackbarOpen(true, 'Шаблон обновлён');
      } else {
        await createTemplate(values);
        setSnackbarOpen(true, 'Шаблон создан');
      }
      setIsFormOpen(false);
      setEditingTemplate(null);
    } catch {
      setSnackbarOpen(
        true,
        editingTemplate
          ? 'Не удалось обновить шаблон'
          : 'Не удалось создать шаблон'
      );
    }
  };

  const handleInstantiate = async ({
    postId,
    executorId,
  }: {
    postId: string;
    executorId?: string;
  }) => {
    if (!useTemplate) return;

    try {
      const task = await instantiateTemplate({
        id: useTemplate.id,
        body: {
          postId,
          ...(executorId && { executorId }),
        },
      });
      setUseTemplate(null);
      setSnackbarOpen(true, 'Задача создана из шаблона');
      navigate(`${ROUTES.TASK}/${task.postId}?taskId=${task.id}`);
    } catch {
      setSnackbarOpen(true, 'Не удалось создать задачу из шаблона');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteTemplate(deleteTarget.id);
      setDeleteTarget(null);
      setSnackbarOpen(true, 'Шаблон удалён');
    } catch {
      setSnackbarOpen(true, 'Не удалось удалить шаблон');
    }
  };

  const handleConfirmDeletePost = async () => {
    if (!deletePostTarget) return;

    try {
      await deletePostTemplate(deletePostTarget.id);
      setDeletePostTarget(null);
      setSnackbarOpen(true, 'Шаблон удалён');
    } catch {
      setSnackbarOpen(true, 'Не удалось удалить шаблон');
    }
  };

  const handleConfirmDeleteFile = async () => {
    if (!deleteFileTarget) return;

    try {
      await deleteFileTemplate(deleteFileTarget.id);
      setDeleteFileTarget(null);
      setSnackbarOpen(true, 'Файл удалён');
    } catch {
      setSnackbarOpen(true, 'Не удалось удалить файл');
    }
  };

  return (
    <PageLayout>
      <Stack
        spacing={1}
        sx={{ flex: 1, minWidth: 0, minHeight: 0 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 2,
            bgcolor: 'white',
            border: '1px solid',
            borderRadius: '24px',
            borderColor: 'divider',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, value: number) => setTab(value)}
            aria-label="Тип шаблона"
          >
            <Tab label="Обьявления" />
            <Tab label="Задачи" />
            <Tab label="Файлы" />
          </Tabs>

          <IconButton
            onClick={handleOpenCreate}
            sx={{ display: { xs: 'block', sm: 'none' } }}
          >
            <Add />
          </IconButton>

          <Button
            variant="contained"
            startIcon={<Add />}
            loading={isUploadingFile}
            disabled={isUploadingFile}
            onClick={handleOpenCreate}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Добавить
          </Button>
        </Stack>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept={MEDIA_FILE_TEMPLATE_ACCEPT}
          onChange={event => void handleUploadFiles(event)}
        />

        {isAnnouncementsTab && isPostTemplatesLoading && (
          <Box
            sx={{
              py: 8,
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {isAnnouncementsTab && isPostTemplatesError && (
          <Box
            sx={{
              py: 6,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <EmptyBlock
              title="Не удалось загрузить шаблоны"
              buttonText="Повторить"
              buttonOnClick={() => void refetchPostTemplates()}
            />
          </Box>
        )}

        {isPostTemplatesEmpty && (
          <Box
            sx={{
              py: 6,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <EmptyBlock title="Шаблонов объявлений пока нет" />
          </Box>
        )}

        {isAnnouncementsTab &&
          !isPostTemplatesLoading &&
          !isPostTemplatesError &&
          postTemplates.length > 0 && (
            <Box
              sx={{
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                  md: '1fr 1fr 1fr',
                },
              }}
            >
              {postTemplates.map(post => (
                <PostTemplateCard
                  key={post.id}
                  post={post}
                  isPublishing={
                    isPublishingPost && publishingPostId === post.id
                  }
                  onPublish={() => void handlePublishPostTemplate(post)}
                  onEdit={() => handleEditPostTemplate(post)}
                  onDelete={() => {
                    if (!requireEmailConfirmed()) return;
                    setDeletePostTarget(post);
                  }}
                />
              ))}
            </Box>
          )}

        {isTasksTab && isLoading && (
          <Box
            sx={{
              py: 8,
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
              alignItems: 'center',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {isTasksTab && isError && (
          <Box
            sx={{
              py: 6,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <EmptyBlock
              title="Не удалось загрузить шаблоны"
              buttonText="Повторить"
              buttonOnClick={() => void refetch()}
            />
          </Box>
        )}

        {isEmpty && (
          <Box
            sx={{
              py: 6,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <EmptyBlock title="Шаблонов задач пока нет" />
          </Box>
        )}

        {isTasksTab && !isLoading && !isError && templates.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              gap: 1,
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1fr 1fr 1fr',
              },
            }}
          >
            {templates.map(template => (
              <TemplateCard
                key={template.id}
                template={template}
                onUse={() => {
                  if (!requireEmailConfirmed()) return;
                  setUseTemplate(template);
                }}
                onEdit={() => {
                  if (!requireEmailConfirmed()) return;
                  setEditingTemplate(template);
                  setIsFormOpen(true);
                }}
                onDelete={() => {
                  if (!requireEmailConfirmed()) return;
                  setDeleteTarget(template);
                }}
              />
            ))}
          </Box>
        )}

        {isFilesTab && isFileTemplatesLoading && (
          <Box
            sx={{
              py: 8,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {isFilesTab && isFileTemplatesError && (
          <Box
            sx={{
              py: 6,
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <EmptyBlock
              title="Не удалось загрузить файлы"
              buttonText="Повторить"
              buttonOnClick={() => void refetchFileTemplates()}
            />
          </Box>
        )}

        {isFileTemplatesEmpty && (
          <Box
            sx={{
              py: 6,
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <EmptyBlock title="Файловых шаблонов пока нет" />
          </Box>
        )}

        {isFilesTab &&
          !isFileTemplatesLoading &&
          !isFileTemplatesError &&
          fileTemplates.length > 0 && (
            <Box
              sx={{
                gap: 1,
                minWidth: 0,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr)',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              {fileTemplates.map(file => (
                <FileTemplateCard
                  key={file.id}
                  file={file}
                  onDelete={() => {
                    if (!requireEmailConfirmed()) return;
                    setDeleteFileTarget(file);
                  }}
                />
              ))}
            </Box>
          )}
      </Stack>

      <TemplateFormDialog
        open={isFormOpen}
        initial={editingTemplate}
        isPending={isCreating || isUpdating}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTemplate(null);
        }}
        onSubmit={handleSubmitForm}
      />

      <UseTemplateDialog
        open={Boolean(useTemplate)}
        template={useTemplate}
        isPending={isInstantiating}
        onClose={() => setUseTemplate(null)}
        onSubmit={handleInstantiate}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Удалить шаблон?"
        description={`Шаблон «${deleteTarget?.name ?? ''}» будет удалён без возможности восстановления.`}
        isPending={isDeleting}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() => void handleConfirmDelete()}
      />

      <ConfirmDialog
        isOpen={Boolean(deletePostTarget)}
        title="Удалить шаблон?"
        description={`Шаблон «${deletePostTarget?.title ?? ''}» будет удалён без возможности восстановления.`}
        isPending={isDeletingPost}
        onClose={() => setDeletePostTarget(null)}
        onSuccess={() => void handleConfirmDeletePost()}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteFileTarget)}
        title="Удалить файл?"
        description={`Файл «${deleteFileTarget?.name ?? ''}» будет удалён без возможности восстановления.`}
        isPending={isDeletingFile}
        onClose={() => setDeleteFileTarget(null)}
        onSuccess={() => void handleConfirmDeleteFile()}
      />
    </PageLayout>
  );
};

export default TemplatesPage;
