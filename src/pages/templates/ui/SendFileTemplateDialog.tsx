import { Close } from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  sortConversationsByUnread,
  toChatMessageMedia,
  useConversationsQuery,
  useCreateConversationMutation,
} from '@/entities/chat';
import {
  sendFileTemplate,
  type FileTemplate,
} from '@/entities/file-template';
import { taskKeys, useSearchTasksQuery } from '@/entities/task';
import { ChatContactSearch } from '@/features/chat';
import {
  FilterAutocomplete,
  type FilterAutocompleteOption,
} from '@/shared';
import chatSocket from '@/shared/api/socket';
import { getChatTaskLabel, useSnackbarStore } from '@/widgets';

const TAB = {
  CHAT: 0,
  TASK: 1,
} as const;

const CONVERSATION_LIST_HEIGHT = 320;
const TAB_PANEL_MIN_HEIGHT = 392;

type SendFileTemplateDialogProps = {
  open: boolean;
  file: FileTemplate | null;
  onClose: () => void;
};

export const SendFileTemplateDialog = ({
  open,
  file,
  onClose,
}: SendFileTemplateDialogProps) => {
  const queryClient = useQueryClient();
  const { setSnackbarOpen } = useSnackbarStore();

  const [tab, setTab] = useState<(typeof TAB)[keyof typeof TAB]>(TAB.CHAT);
  const [selectedPeerId, setSelectedPeerId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState('all');
  const [selectedTaskOption, setSelectedTaskOption] =
    useState<FilterAutocompleteOption | null>(null);
  const [taskSearch, setTaskSearch] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: conversations = [], isLoading: isConversationsLoading } =
    useConversationsQuery(undefined, { enabled: open });
  const { mutateAsync: createConversation } = useCreateConversationMutation();

  const { data: tasksData, isFetching: isTasksLoading } = useSearchTasksQuery({
    q: open ? taskSearch : '',
    page: 1,
    limit: 20,
  });

  const taskOptions = useMemo(
    () =>
      (tasksData?.items ?? []).map(task => ({
        id: task.id,
        label: getChatTaskLabel(task),
      })),
    [tasksData?.items]
  );

  const availableConversations = useMemo(
    () => sortConversationsByUnread(conversations),
    [conversations]
  );

  useEffect(() => {
    if (open) return;

    setTimeout(() => {
      setTab(TAB.CHAT);

      setSelectedPeerId(null);
      setSelectedTaskId('all');
      setSelectedTaskOption(null);
      setTaskSearch('');
      setError(null);
      setIsSending(false);
    }, 0);
  }, [open]);

  const canSubmit =
    tab === TAB.CHAT ? Boolean(selectedPeerId) : selectedTaskId !== 'all';

  const handleClose = () => {
    if (isSending) return;
    onClose();
  };

  const handleSendToChat = async (peerId: string) => {
    if (!file) return;

    const existing = conversations.find(
      conversation => conversation.peer.id === peerId
    );
    const conversation =
      existing ?? (await createConversation({ recipientId: peerId }));

    const upload = await sendFileTemplate(file.id, {
      conversationId: conversation.id,
    });

    chatSocket.connect();
    chatSocket.joinConversation(conversation.id);
    chatSocket.sendMessage({
      conversationId: conversation.id,
      media: [toChatMessageMedia(upload)],
    });
  };

  const handleSendToTask = async (taskId: string) => {
    if (!file) return;

    await sendFileTemplate(file.id, { taskId });
    void queryClient.invalidateQueries({ queryKey: taskKeys.all });
  };

  const handleSend = async () => {
    if (!file || isSending || !canSubmit) return;

    try {
      setIsSending(true);
      setError(null);

      if (tab === TAB.CHAT && selectedPeerId) {
        await handleSendToChat(selectedPeerId);
        setSnackbarOpen(true, 'Файл отправлен в чат');
      } else if (tab === TAB.TASK && selectedTaskId !== 'all') {
        await handleSendToTask(selectedTaskId);
        setSnackbarOpen(true, 'Файл добавлен в задачу');
      }

      onClose();
    } catch {
      setError(
        tab === TAB.CHAT
          ? 'Не удалось отправить файл в чат'
          : 'Не удалось добавить файл в задачу'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 0, md: '24px' }, p: 2, m: 0,
            height: { xs: '100%', md: 'auto' },
            width: { xs: '100%', md: 560 },
            minHeight: { xs: '100%', md: 'auto' },
            maxHeight: { xs: '100%', md: 'auto' },
          },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
      >
        <Typography variant="h6">Отправить файл</Typography>
        <IconButton
          aria-label="Закрыть"
          onClick={handleClose}
          disabled={isSending}
        >
          <Close />
        </IconButton>
      </Stack>

      {file && (
        <Box
          sx={{
            mb: 2,
            px: 1.5,
            py: 1.25,
            borderRadius: '12px',
            bgcolor: 'action.hover',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {file.name}
          </Typography>
        </Box>
      )}

      <Tabs
        value={tab}
        onChange={(_, value) => {
          if (isSending) return;
          setTab(value === TAB.TASK ? TAB.TASK : TAB.CHAT);
          setError(null);
        }}
        sx={{ mb: 2 }}
      >
        <Tab
          label="В чат"
          disabled={isSending}
        />
        <Tab
          label="В задачу"
          disabled={isSending}
        />
      </Tabs>

      <Box sx={{ minHeight: TAB_PANEL_MIN_HEIGHT }}>
        {tab === TAB.CHAT && (
          <>
            <Box sx={{ mb: 2, }}>
              <ChatContactSearch
                withFilter={false}
                disabled={isSending}
                placeholder="Поиск по чатам"
                onSelect={user => {
                  setSelectedPeerId(user.id);
                }}
              />
            </Box>

            <Box
              sx={{
                p: 1,
                minHeight: { xs: 'calc(100% - 60px)', md: CONVERSATION_LIST_HEIGHT },
                maxHeight: { xs: 'calc(100% - 60px)', md: CONVERSATION_LIST_HEIGHT },
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '16px',
              }}
            >
              {isConversationsLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={28} />
                </Box>
              )}

              {!isConversationsLoading && !availableConversations.length && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'center', py: 3 }}
                >
                  Нет доступных контактов
                </Typography>
              )}

              {!isConversationsLoading &&
                availableConversations.map(conversation => {
                  const isSelected = selectedPeerId === conversation.peer.id;

                  return (
                    <Stack
                      key={conversation.id}
                      direction="row"
                      spacing={1.5}
                      onClick={() => {
                        if (!isSending) {
                          setSelectedPeerId(conversation.peer.id);
                        }
                      }}
                      sx={{
                        p: 1.5,
                        cursor: isSending ? 'default' : 'pointer',
                        borderRadius: '12px',
                        alignItems: 'center',
                        bgcolor: isSelected ? 'primary.light' : 'transparent',
                        '&:hover': {
                          bgcolor: isSending
                            ? 'transparent'
                            : isSelected
                              ? 'primary.light'
                              : 'action.hover',
                        },
                      }}
                    >
                      <Avatar src={conversation.peer.avatar ?? undefined}>
                        {conversation.peer.displayName.charAt(0)}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body1"
                          noWrap
                          sx={{
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? 'common.white' : 'text.primary',
                          }}
                        >
                          {conversation.peer.displayName}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
            </Box>
          </>
        )}

        {tab === TAB.TASK && (
          <FilterAutocomplete
            label="Задача"
            placeholder="Поиск по задачам"
            value={selectedTaskId}
            options={taskOptions}
            selectedOption={selectedTaskOption}
            loading={isTasksLoading}
            minInputLength={2}
            onSearch={setTaskSearch}
            onChange={id => {
              if (id === 'all') {
                setSelectedTaskOption(null);
                setSelectedTaskId('all');
                return;
              }

              const option =
                taskOptions.find(item => item.id === id) ?? selectedTaskOption;
              setSelectedTaskOption(option);
              setSelectedTaskId(id);
            }}
          />
        )}
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mt: 2 }}
        >
          {error}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: 'flex-end', mt: 3, position: tab === TAB.TASK ? 'absolute' : 'static', bottom: 16, right: 16, width: '100%' }}
      >
        <Button
          variant="outlined"
          onClick={handleClose}
          disabled={isSending}
        >
          Отмена
        </Button>
        <Button
          variant="contained"
          disabled={!canSubmit || isSending}
          onClick={() => void handleSend()}
          startIcon={
            isSending ? (
              <CircularProgress
                size={16}
                color="inherit"
              />
            ) : undefined
          }
        >
          Отправить
        </Button>
      </Stack>
    </Dialog >
  );
};
