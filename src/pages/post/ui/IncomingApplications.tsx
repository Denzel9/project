import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { Link } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  getApplicantName,
  usePostApplicationsQuery,
  useUpdateApplicationStatusMutation,
} from '@/entities/application';
import { ROUTES } from '@/shared/config/routes';

type IncomingApplicationsProps = {
  postId: string;
};

export const IncomingApplications = ({ postId }: IncomingApplicationsProps) => {
  const { data: applications, isLoading } = usePostApplicationsQuery(postId, {
    page: 1,
    limit: 20,
  });
  const { mutate: updateStatus, isPending } =
    useUpdateApplicationStatusMutation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!applications?.items?.length) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ py: 4, textAlign: 'center' }}
      >
        Пока нет откликов на этот пост
      </Typography>
    );
  }

  return (
    <Stack
      spacing={2}
      sx={{ mt: 4 }}
    >
      <Typography variant="h6">Отклики на пост</Typography>

      {applications.items.map(application => (
        <Box
          key={application.id}
          sx={{
            p: 3,
            borderRadius: '24px',
            border: theme => `1px solid ${theme.palette.secondary.main}`,
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'start' }}
          >
            <Avatar src={application.applicant?.avatar ?? undefined} />

            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1">
                  {getApplicantName(application.applicant)}
                </Typography>

                <Chip
                  size="small"
                  label={APPLICATION_STATUS_LABELS[application.status]}
                  color={
                    application.status === 'ACCEPTED'
                      ? 'success'
                      : application.status === 'REJECTED'
                        ? 'error'
                        : 'primary'
                  }
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {new Date(application.createdAt).toLocaleDateString('ru-RU')}
              </Typography>

              <Typography
                variant="body1"
                sx={{ mt: 2 }}
              >
                {application.message}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                sx={{ mt: 2 }}
              >
                {application.applicant?.id && (
                  <Button
                    size="small"
                    component={Link}
                    to={`${ROUTES.CHAT}?recipientId=${application.applicant.id}`}
                  >
                    В чат
                  </Button>
                )}

                {application.status === 'NEW' && (
                  <Button
                    size="small"
                    disabled={isPending}
                    onClick={() =>
                      updateStatus({
                        id: application.id,
                        body: { status: 'VIEWED' },
                      })
                    }
                  >
                    Просмотрен
                  </Button>
                )}

                {(application.status === 'NEW' ||
                  application.status === 'VIEWED') && (
                  <>
                    <Button
                      size="small"
                      color="success"
                      disabled={isPending}
                      onClick={() =>
                        updateStatus({
                          id: application.id,
                          body: { status: 'ACCEPTED' },
                        })
                      }
                    >
                      Принять
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      disabled={isPending}
                      onClick={() =>
                        updateStatus({
                          id: application.id,
                          body: { status: 'REJECTED' },
                        })
                      }
                    >
                      Отклонить
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
};
