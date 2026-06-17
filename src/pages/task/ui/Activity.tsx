import { FilterListOutlined } from '@mui/icons-material';
import Timeline from '@mui/lab/Timeline';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineOppositeContent, {
  timelineOppositeContentClasses,
} from '@mui/lab/TimelineOppositeContent';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import {
  Box,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';

import {
  formatTaskActivityText,
  TASK_ACTIVITY_LABELS,
  useTaskActivitiesQuery,
  type TaskActivityType,
} from '@/entities/task';

type ActivityProps = {
  taskId: string;
};

const formatActivityTime = (createdAt: string) =>
  new Date(createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const Activity = ({ taskId }: ActivityProps) => {
  const [activityType, setActivityType] = useState<
    TaskActivityType | undefined
  >(undefined);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChangeActivityType =
    (type: TaskActivityType | undefined) => () => {
      if (type === activityType) {
        setActivityType(undefined);
      } else {
        setActivityType(type);
      }
      handleClose();
    };

  const { data, isLoading } = useTaskActivitiesQuery(taskId, {
    page: 1,
    limit: 20,
    type: activityType,
  });

  const activities = data?.items ?? [];

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: 'white',
        p: { xs: 3, md: 4 },
        borderRadius: '32px',
        height: 'fit-content',
      }}
    >
      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h6">Активность</Typography>

        <IconButton onClick={handleClick}>
          <FilterListOutlined />
        </IconButton>

        <Menu
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
        >
          {/* TODO: Refactor */}
          <MenuItem
            sx={{
              transition: 'all 0.3s ease',
              color: activityType === undefined ? 'white' : 'text.primary',
              bgcolor:
                activityType === undefined ? 'primary.light' : 'transparent',
              ':hover': {
                bgcolor:
                  activityType === undefined ? 'primary.main' : 'transparent',
              },
            }}
            onClick={handleChangeActivityType(undefined)}
          >
            <Typography>Все</Typography>
          </MenuItem>

          {/* TODO: Refactor */}
          {Object.entries(TASK_ACTIVITY_LABELS).map(([key, label]) => (
            <MenuItem
              sx={{
                transition: 'all 0.3s ease',
                color: activityType === key ? 'white' : 'text.primary',
                bgcolor: activityType === key ? 'primary.light' : 'transparent',
                ':hover': {
                  bgcolor:
                    activityType === key ? 'primary.main' : 'transparent',
                },
              }}
              key={key}
              onClick={handleChangeActivityType(key as TaskActivityType)}
            >
              <Typography>{label}</Typography>
            </MenuItem>
          ))}
        </Menu>
      </Stack>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {!isLoading && activities.length === 0 && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          Пока нет активности
        </Typography>
      )}

      {!isLoading && activities.length > 0 && (
        <Timeline
          sx={{
            mt: 2,
            padding: 0,
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0,
              pl: 0,
              minWidth: 'fit-content',
            },
          }}
        >
          {activities.map((activity, index) => (
            <TimelineItem key={activity.id}>
              <TimelineOppositeContent color="textSecondary">
                {formatActivityTime(activity.createdAt)}
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot />
                {index < activities.length - 1 && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                {formatTaskActivityText(activity)}
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </Box>
  );
};
