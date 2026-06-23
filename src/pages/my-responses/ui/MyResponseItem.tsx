import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { getUserName, type User } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { FavoriteButton } from '@/widgets';

type MyResponseItemProps = {
  isFavorite?: boolean;
  isWithdrawing?: boolean;
  application: Application;
  onWithdraw: (applicationId: string) => void;
};

export const MyResponseItem = ({
  onWithdraw,
  application,
  isFavorite = false,
  isWithdrawing = false,
}: MyResponseItemProps) => (
  <Stack
    direction="column"
    sx={{
      p: 2,
      height: '100%',
      bgcolor: 'white',
      borderRadius: '24px',
      justifyContent: 'space-between',
      border: theme => `1px solid ${theme.palette.secondary.main}`,
      transition: 'box-shadow 0.2s ease',
      ':hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      },
    }}
  >
    <Box>
      <Stack
        direction="row"
        sx={{
          alignItems: 'start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Link
            to={`${ROUTES.POST}/${application.post?.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography
              variant="h6"
              sx={{
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {application.post?.title}
            </Typography>
          </Link>

          <Link
            to={`${ROUTES.PROFILE}?userId=${application.post?.ownerId}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography
              variant="body2"
              color="info"
              sx={{
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              {getUserName(application.post?.owner as Partial<User>)}
            </Typography>
          </Link>
        </Box>

        {/* TODO: refactor */}
        <Chip
          size="small"
          label={`${APPLICATION_STATUS_LABELS[application.status]} ${format(new Date(application.updatedAt), 'dd.MM.yyyy')}`}
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
    </Box>

    <Stack
      direction="row"
      spacing={2}
      sx={{ mt: 4, justifyContent: 'space-between' }}
    >
      {status === APPLICATION_STATUS_ENUM.NEW && (
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

      {application.status === APPLICATION_STATUS_ENUM.ACCEPTED && (
        <Button
          size="small"
          component={Link}
          variant="outlined"
          to={`${ROUTES.CHAT}?recipientId=${application.post?.ownerId}`}
        >
          В чат
        </Button>
      )}

      {(application.status === APPLICATION_STATUS_ENUM.NEW ||
        application.status === APPLICATION_STATUS_ENUM.VIEWED) && (
        <Typography
          variant="body2"
          color="info"
          sx={{ width: '70%' }}
        >
          Написать в чат можно после того, как отклик будет принят
        </Typography>
      )}

      {(application.status === APPLICATION_STATUS_ENUM.WITHDRAWN ||
        application.status === APPLICATION_STATUS_ENUM.REJECTED) && (
        <Typography
          variant="body2"
          color="info"
          sx={{ width: '70%' }}
        >
          Повторный отклик недоступен. Но вы можете откликнуться на другие
          обьявления компании
        </Typography>
      )}

      <FavoriteButton
        isFavorite={isFavorite}
        postId={application.post?.id ?? ''}
      />
    </Stack>
  </Stack>
);
