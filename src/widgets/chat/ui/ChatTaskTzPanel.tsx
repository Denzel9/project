import { Close } from '@mui/icons-material';
import {
  Box,
  Drawer,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';

import { type Task } from '@/entities/task';
import {
  extractChatTaskTzMessages,
  type ChatTaskTzItem,
} from '../model/utils/chatTaskTzMessages';
import { getChatTaskLabel } from '../model/utils/utils';

import { ChatMessageBubble } from './ChatMessageBubble';

import type { ChatMessage } from '@/entities/chat';

type ChatTaskTzPanelProps = {
  open: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  tasks: Task[];
  currentUserId: string | null;
};

const ALL_TASKS_VALUE = 'all';

export const ChatTaskTzPanel = ({
  open,
  onClose,
  messages,
  tasks,
  currentUserId,
}: ChatTaskTzPanelProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedTaskId, setSelectedTaskId] = useState(ALL_TASKS_VALUE);

  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSelectedTaskId(ALL_TASKS_VALUE);
      }, 0);
    }
  }, [open]);

  const taskTzItems = useMemo(
    () =>
      extractChatTaskTzMessages(messages).sort(
        (left, right) =>
          new Date(right.message.createdAt).getTime() -
          new Date(left.message.createdAt).getTime(),
      ),
    [messages]
  );

  const taskOptions = useMemo(() => {
    const tasksById = new Map(
      tasks.map(task => [task.id, getChatTaskLabel(task)]),
    );
    const options = new Map<string, string>();

    taskTzItems.forEach(item => {
      if (!options.has(item.taskId)) {
        options.set(item.taskId, tasksById.get(item.taskId) ?? item.title);
      }
    });

    return Array.from(options.entries()).map(([id, label]) => ({ id, label }));
  }, [taskTzItems, tasks]);

  useEffect(() => {
    if (
      selectedTaskId !== ALL_TASKS_VALUE &&
      !taskOptions.some(option => option.id === selectedTaskId)
    ) {
      setTimeout(() => {
        setSelectedTaskId(ALL_TASKS_VALUE);
      }, 0);
    }
  }, [selectedTaskId, taskOptions]);

  const filteredItems = useMemo(() => {
    if (selectedTaskId === ALL_TASKS_VALUE) {
      return taskTzItems;
    }

    return taskTzItems.filter(item => item.taskId === selectedTaskId);
  }, [selectedTaskId, taskTzItems]);

  const renderItem = (item: ChatTaskTzItem) => (
    <Box
      key={item.message.id}
      sx={{ width: '100%' }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: 'block' }}
      >
        {format(new Date(item.message.createdAt), 'dd.MM.yyyy HH:mm')}
      </Typography>
      <ChatMessageBubble
        fullWidth
        readOnly
        message={item.message}
        currentUserId={currentUserId}
      />
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={[
        { zIndex: theme => theme.zIndex.modal + 1 },
        {
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: { xs: 0, md: 32 },
            borderBottomLeftRadius: { xs: 0, md: 32 },
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, md: 4 },
            width: isMobile ? '100%' : 560,
          },
        },
      ]}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6">Технические задания</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Stack>

      {taskTzItems.length > 0 && (
        <TextField
          select
          fullWidth
          size="small"
          label="Задача"
          value={selectedTaskId}
          onChange={event => setSelectedTaskId(event.target.value)}
          slotProps={{
            select: {
              MenuProps: {
                sx: {
                  zIndex: theme.zIndex.modal + 2,
                },
              },
            },
          }}
          sx={{ mb: 2, flexShrink: 0 }}
        >
          <MenuItem value={ALL_TASKS_VALUE}>Все ТЗ</MenuItem>
          {taskOptions.map(option => (
            <MenuItem
              key={option.id}
              value={option.id}
            >
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {taskTzItems.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            В этом чате пока нет отправленных ТЗ
          </Typography>
        )}

        {taskTzItems.length > 0 && filteredItems.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 4 }}
          >
            По выбранной задаче ТЗ не найдено
          </Typography>
        )}

        {filteredItems.map(renderItem)}

      </Box>
    </Drawer>
  );
};
