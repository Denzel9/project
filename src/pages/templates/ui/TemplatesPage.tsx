import {
  Add,
  DeleteOutlined,
  EditOutlined,
  MoreVert,
  PlayArrowOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
import { useState } from 'react';
import { useNavigate } from 'react-router';

import {
  useCreateTaskTemplateMutation,
  useDeleteTaskTemplateMutation,
  useInstantiateTaskTemplateMutation,
  useTaskTemplatesQuery,
  useUpdateTaskTemplateMutation,
  type CreateTaskTemplateDto,
  type TaskTemplate,
} from '@/entities';
import { useRequireEmailConfirmed } from '@/features/auth';
import { EmptyBlock, ROUTES } from '@/shared';
import { ConfirmDialog, PageLayout, useSnackbarStore } from '@/widgets';

import { TemplateFormDialog } from './TemplateFormDialog';
import { UseTemplateDialog } from './UseTemplateDialog';

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

export const TemplatesPage = () => {
  const navigate = useNavigate();
  const { setSnackbarOpen } = useSnackbarStore();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const { data, isLoading, isError, refetch } = useTaskTemplatesQuery();
  const { mutateAsync: createTemplate, isPending: isCreating } =
    useCreateTaskTemplateMutation();
  const { mutateAsync: updateTemplate, isPending: isUpdating } =
    useUpdateTaskTemplateMutation();
  const { mutateAsync: deleteTemplate, isPending: isDeleting } =
    useDeleteTaskTemplateMutation();
  const { mutateAsync: instantiateTemplate, isPending: isInstantiating } =
    useInstantiateTaskTemplateMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null
  );
  const [useTemplate, setUseTemplate] = useState<TaskTemplate | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TaskTemplate | null>(null);

  const templates = data ?? [];
  const isEmpty = !isLoading && !isError && templates.length === 0;

  const handleOpenCreate = () => {
    if (!requireEmailConfirmed()) return;
    setEditingTemplate(null);
    setIsFormOpen(true);
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

  const handleInstantiate = async (postId: string) => {
    if (!useTemplate) return;

    try {
      const task = await instantiateTemplate({
        id: useTemplate.id,
        body: { postId },
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

  return (
    <PageLayout>
      <Stack
        spacing={1}
        sx={{ flex: 1, minHeight: 0 }}
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
            value={0}
            onChange={() => {}}
            aria-label="basic tabs example"
          >
            <Tab label="Обьявления" />
            <Tab label="Задачи" />
            <Tab label="Файлы" />
          </Tabs>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
          >
            Добавить
          </Button>
        </Stack>

        {isLoading && (
          <Box
            sx={{
              py: 8,
              display: 'flex',
              justifyContent: 'center',
              border: '1px solid',
              borderRadius: '24px',
              borderColor: 'divider',
              bgcolor: 'white',
            }}
          >
            <CircularProgress size={32} />
          </Box>
        )}

        {isError && (
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
            }}
          >
            <EmptyBlock title="Шаблонов пока нет" />
          </Box>
        )}

        {!isLoading && !isError && templates.length > 0 && (
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
    </PageLayout>
  );
};

export default TemplatesPage;
