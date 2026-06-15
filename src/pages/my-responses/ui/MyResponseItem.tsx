import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  canWithdrawApplication,
  type Application,
} from '@/entities/application';
import { ROUTES } from '@/shared/config/routes';

type MyResponseItemProps = {
  application: Application;
  isWithdrawing?: boolean;
  onWithdraw: (applicationId: string) => void;
};

export const MyResponseItem = ({
  application,
  isWithdrawing = false,
  onWithdraw,
}: MyResponseItemProps) => (
  <Box
    sx={{
      p: 3,
      height: '100%',
      borderRadius: '24px',
      border: theme => `1px solid ${theme.palette.secondary.main}`,
    }}
  >
    <Stack
      direction="row"
      sx={{
        alignItems: 'start',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box>
        <Link
          to={`${ROUTES.POST}/${application.postId}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Typography variant="h6">
            {application.post?.title ?? 'Пост'}
          </Typography>
        </Link>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          {new Date(application.createdAt).toLocaleDateString('ru-RU')}
        </Typography>
      </Box>

      <Stack
        spacing={1}
        sx={{ alignItems: 'flex-end', flexShrink: 0 }}
      >
        <Chip
          size="small"
          label={APPLICATION_STATUS_LABELS[application.status]}
          color={
            application.status === 'ACCEPTED'
              ? 'success'
              : application.status === 'REJECTED'
                ? 'error'
                : application.status === 'WITHDRAWN'
                  ? 'default'
                  : 'primary'
          }
        />
      </Stack>
    </Stack>

    <Stack
      direction="row"
      spacing={2}
      sx={{ mt: 4 }}
    >
      {canWithdrawApplication(application.status) && (
        <Button
          size="small"
          color="error"
          variant="outlined"
          disabled={isWithdrawing}
          onClick={() => onWithdraw(application.id)}
        >
          Отозвать
        </Button>
      )}

      {application.post?.ownerId && (
        <Button
          size="small"
          variant="outlined"
          component={Link}
          to={`${ROUTES.CHAT}?recipientId=${application.post.ownerId}`}
        >
          В чат
        </Button>
      )}
    </Stack>
  </Box>
);
