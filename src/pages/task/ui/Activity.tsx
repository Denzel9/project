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
  TaskActivityType,
  type TaskActivity,
} from '@/entities/task';
import { ConfirmDialog } from '@/widgets';

import { ActivityDiffView } from './ActivityDiffView';

type ActivityProps = {
  isLoading: boolean;
  activities: TaskActivity[];
  activityType?: TaskActivityType;
  setActivityType: (type?: TaskActivityType) => void;
};

const formatActivityTime = (createdAt: string) =>
  new Date(createdAt).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const Activity = ({
  isLoading,
  activities,
  activityType,
  setActivityType,
}: ActivityProps) => {
  const [activityDialog, setActivityDialog] = useState<{
    isOpen: boolean;
    title: string;
    from: string;
    to: string;
  }>({
    isOpen: false,
    title: '',
    from: '',
    to: '',
  });
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

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        bgcolor: 'white',
        overflow: 'hidden',
        maxHeight: '500px',
        p: { xs: 3, md: 4 },
        borderRadius: '32px',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction="row"
        sx={{
          flexShrink: 0,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
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
        <Box
          sx={{
            mt: 2,
            minHeight: 0,
            overflowY: 'auto',
          }}
        >
          <Timeline
            sx={{
              padding: 0,
              [`& .${timelineOppositeContentClasses.root}`]: {
                flex: 0,
                pl: 0,
              },
            }}
          >
            {activities?.map((activity, index) => (
              <TimelineItem
                key={activity.id}
                sx={{
                  height: '100px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
                onClick={() => {
                  setActivityDialog({
                    isOpen: true,
                    title: TASK_ACTIVITY_LABELS[activity.type],
                    from: activity.payload.from,
                    to: activity.payload.to,
                  });
                }}
              >
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
        </Box>
      )}

      <ConfirmDialog
        width={1000}
        title={activityDialog.title}
        onClose={() =>
          setActivityDialog({ isOpen: false, title: '', from: '', to: '' })
        }
        isOpen={activityDialog.isOpen}
      >
        <ActivityDiffView
          isOpen={activityDialog.isOpen}
          from={activityDialog.from}
          to={activityDialog.to}
        />
      </ConfirmDialog>
    </Box>
  );
};
