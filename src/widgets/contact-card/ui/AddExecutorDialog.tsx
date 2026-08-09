import { Check } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import {
  getFavoriteUserName,
  isFavoriteUserItem,
  useConversationsQuery,
  useFavoritesQuery,
  useUpdateTaskMutation,
} from '@/entities';
import { useSnackbarStore } from '@/widgets';

type AddExecutorDialogProps = {
  taskId: string;
  isOpen: boolean;
  onClose: () => void;
};

type ExecutorOption = {
  id: string;
  label: string;
};

type SourceTab = 'dialogs' | 'favorites';

export const AddExecutorDialog = ({
  taskId,
  isOpen,
  onClose,
}: AddExecutorDialogProps) => {
  const [tab, setTab] = useState<SourceTab>('dialogs');
  const [executorId, setExecutorId] = useState<string | null>(null);
  const { mutateAsync: updateTask, isPending } = useUpdateTaskMutation();
  const { setSnackbarOpen } = useSnackbarStore();

  const { data: conversations, isLoading: isConversationsLoading } =
    useConversationsQuery(undefined, {
      enabled: isOpen,
    });

  const { data: favoriteCreators, isLoading: isCreatorsLoading } =
    useFavoritesQuery(
      { type: 'CREATOR', page: 1, limit: 100 },
      { enabled: isOpen },
    );

  const { data: favoriteCompanies, isLoading: isCompaniesLoading } =
    useFavoritesQuery(
      { type: 'COMPANY', page: 1, limit: 100 },
      { enabled: isOpen },
    );

  const conversationOptions = useMemo(() => {
    const uniqueById = new Map<string, ExecutorOption>();

    for (const conversation of conversations ?? []) {
      if (conversation.isNotes) continue;

      const { peer } = conversation;
      if (!peer?.id || uniqueById.has(peer.id)) continue;

      uniqueById.set(peer.id, {
        id: peer.id,
        label: peer.displayName || 'Пользователь',
      });
    }

    return [...uniqueById.values()].sort((a, b) =>
      a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' }),
    );
  }, [conversations]);

  const favoriteOptions = useMemo(() => {
    const uniqueById = new Map<string, ExecutorOption>();
    const items = [
      ...(favoriteCreators?.items ?? []),
      ...(favoriteCompanies?.items ?? []),
    ];

    for (const item of items) {
      if (!isFavoriteUserItem(item) || uniqueById.has(item.userId)) continue;

      uniqueById.set(item.userId, {
        id: item.userId,
        label: getFavoriteUserName(item.user),
      });
    }

    return [...uniqueById.values()].sort((a, b) =>
      a.label.localeCompare(b.label, 'ru', { sensitivity: 'base' }),
    );
  }, [favoriteCreators, favoriteCompanies]);

  const options = tab === 'dialogs' ? conversationOptions : favoriteOptions;
  const isLoading =
    tab === 'dialogs'
      ? isConversationsLoading
      : isCreatorsLoading || isCompaniesLoading;

  const handleClose = () => {
    if (isPending) return;

    setExecutorId(null);
    setTab('dialogs');
    onClose();
  };

  const handleAddExecutor = async () => {
    if (!executorId || isPending) return;

    try {
      const res = await updateTask({
        id: taskId,
        body: { executorId },
      });

      if (res.id) {
        setSnackbarOpen(true, 'Исполнитель успешно добавлен');
        handleClose();
        return;
      }

      setSnackbarOpen(true, 'Не удалось добавить исполнителя', 'error');
    } catch {
      setSnackbarOpen(
        true,
        'Не удалось добавить исполнителя. Попробуйте позже',
        'error',
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      sx={{
        p: 4,
        '& .MuiDialog-paper': {
          borderRadius: '32px',
          maxWidth: '90%',
          minWidth: '560px',
          padding: '24px',
        },
      }}
    >
      <Typography variant="h6">Добавить исполнителя</Typography>

      <Tabs
        value={tab}
        onChange={(_, value: SourceTab) => setTab(value)}
        sx={{ mt: 2, mb: 1 }}
      >
        <Tab
          value="dialogs"
          label="Из диалогов"
        />
        <Tab
          value="favorites"
          label="Из избранного"
        />
      </Tabs>

      <Box sx={{ mt: 1, maxHeight: 320, overflowY: 'auto' }}>
        {isLoading ? (
          <Stack sx={{ alignItems: 'center', py: 4 }}>
            <CircularProgress size={28} />
          </Stack>
        ) : options.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ py: 2 }}
          >
            {tab === 'dialogs'
              ? 'Нет доступных диалогов'
              : 'В избранном пока нет исполнителей'}
          </Typography>
        ) : (
          <List disablePadding>
            {options.map(option => {
              const isSelected = executorId === option.id;

              return (
                <ListItemButton
                  key={option.id}
                  selected={isSelected}
                  onClick={() => setExecutorId(option.id)}
                  sx={{ borderRadius: '16px', mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {isSelected ? <Check fontSize="small" /> : null}
                  </ListItemIcon>
                  <ListItemText primary={option.label} />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Button
          variant="outlined"
          color="primary"
          disabled={isPending}
          onClick={handleClose}
        >
          Отменить
        </Button>

        <Button
          variant="contained"
          color="primary"
          loading={isPending}
          disabled={!executorId || isPending}
          onClick={() => void handleAddExecutor()}
        >
          Добавить исполнителя
        </Button>
      </Stack>
    </Dialog>
  );
};
