import { PushPinOutlined } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';

import type { TaskCommentPin } from '@/entities/task';

type TaskCommentPinnedHeaderProps = {
  pinnedComments: TaskCommentPin[];
  onJumpToComment: (commentId: string) => void;
};

const getPinPreview = (pin: TaskCommentPin) => {
  const trimmed = pin.content.trim();
  if (trimmed) return trimmed;
  if (pin.mediaCount > 0) return 'Вложение';
  return 'Комментарий';
};

export const TaskCommentPinnedHeader = ({
  pinnedComments,
  onJumpToComment,
}: TaskCommentPinnedHeaderProps) => {
  if (pinnedComments.length === 0) {
    return null;
  }

  const firstPin = pinnedComments[0];

  return (
    <Box
      sx={{
        pb: 1,
        top: 0,
        zIndex: 10,
        position: 'sticky',
        px: { xs: 1.25, md: 1.5 },
        pt: { xs: 1.25, md: 1.5 },
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        onClick={() => onJumpToComment(firstPin.commentId)}
        sx={{
          alignItems: 'center',
          px: 1.5,
          py: 1.25,
          cursor: 'pointer',
          borderRadius: '16px',
          bgcolor: 'common.white',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.light',
            color: 'common.white',
          }}
        >
          <PushPinOutlined sx={{ fontSize: 18 }} />
        </Box>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, display: 'block' }}
          >
            {pinnedComments.length > 1
              ? `Закреплено · ${pinnedComments.length}`
              : 'Закреплённый комментарий'}
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 500 }}
          >
            {getPinPreview(firstPin)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};
