import { ChatOutlined } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  getApplicantName,
  useUpdateApplicationStatusMutation,
  type ApplicationList,
} from '@/entities/application';
import { POST_STATUS_ENUM } from '@/entities/post';
import { EmptyBlock } from '@/shared';
import { ROUTES } from '@/shared/config/routes';

type IncomingApplicationsProps = {
  applications?: ApplicationList;
  isLoading: boolean;
  emptyTitle?: string;
};

export const IncomingApplications = ({
  applications,
  isLoading,
  emptyTitle = 'Пока нет откликов на этот пост',
}: IncomingApplicationsProps) => {
  const navigate = useNavigate();

  const { mutateAsync: updateStatus, isPending } =
    useUpdateApplicationStatusMutation();

  useEffect(() => {
    if (applications?.items?.length) {
      applications.items.forEach(application => {
        if (application.status === POST_STATUS_ENUM.NEW) {
          updateStatus({
            id: application.id,
            body: { status: POST_STATUS_ENUM.VIEWED },
          });
        }
      });
    }
  }, [applications?.items, updateStatus]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!applications?.items?.length) {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          bgcolor: 'white',
          alignItems: 'center',
          borderRadius: '32px',
          justifyContent: 'center',
        }}
      >
        <EmptyBlock title={emptyTitle} />
      </Box>
    );
  }

  return (
    <Grid
      container
      spacing={2}
    >
      {applications.items.map(application => (
        <Grid
          size={{ xs: 12, md: 4 }}
          key={application.id}
          sx={{
            p: 3,
            bgcolor: 'common.white',
            borderRadius: '32px',
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'start', justifyContent: 'space-between' }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: 'center', cursor: 'pointer' }}
                onClick={() =>
                  navigate(
                    `${ROUTES.PROFILE}?userId=${application.applicant?.id}`
                  )
                }
              >
                <Avatar
                  src={application.applicant?.avatar ?? undefined}
                  sx={{ width: 60, height: 60 }}
                />

                <Stack
                  direction="column"
                  spacing={1}
                >
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
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {new Date(application.createdAt).toLocaleDateString(
                      'ru-RU'
                    )}
                  </Typography>
                </Stack>
              </Stack>
              <Chip
                size="small"
                label={APPLICATION_STATUS_LABELS[application.status]}
                color={
                  application.status === POST_STATUS_ENUM.ACCEPTED
                    ? 'success'
                    : application.status === POST_STATUS_ENUM.REJECTED
                      ? 'error'
                      : 'primary'
                }
              />
            </Stack>

            <Typography
              variant="body1"
              sx={{ mt: 4 }}
            >
              {application.message}
            </Typography>

            <Stack
              direction={{ xs: 'row-reverse', md: 'row' }}
              sx={{
                width: '100%',
                mt: 4,
                mr: { xs: 0, md: 4 },
                justifyContent: { xs: 'space-between', md: 'flex-start' },
              }}
            >
              {application.applicant?.id && (
                <>
                  <Button
                    size="small"
                    variant="contained"
                    component={Link}
                    sx={{
                      mr: { xs: 0, md: 4 },
                      display: { xs: 'none', md: 'block' },
                    }}
                    to={`${ROUTES.CHAT}?recipientId=${application.applicant.id}`}
                  >
                    В чат
                  </Button>

                  <IconButton
                    size="small"
                    color="primary"
                    component={Link}
                    sx={{ display: { xs: 'flex', md: 'none' } }}
                    to={`${ROUTES.CHAT}?recipientId=${application.applicant.id}`}
                  >
                    <ChatOutlined />
                  </IconButton>
                </>
              )}

              {(application.status === POST_STATUS_ENUM.NEW ||
                application.status === POST_STATUS_ENUM.VIEWED) && (
                <Stack
                  direction="row"
                  spacing={4}
                >
                  <Button
                    size="small"
                    color="error"
                    disabled={isPending}
                    sx={{ px: { xs: 0, md: 'auto' } }}
                    onClick={() =>
                      updateStatus({
                        id: application.id,
                        body: { status: POST_STATUS_ENUM.REJECTED },
                      })
                    }
                  >
                    Отклонить
                  </Button>

                  <Button
                    size="small"
                    color="success"
                    disabled={isPending}
                    sx={{ px: { xs: 0, md: 'auto' } }}
                    onClick={() =>
                      updateStatus({
                        id: application.id,
                        body: { status: POST_STATUS_ENUM.ACCEPTED },
                      }).then(() => {
                        navigate(ROUTES.MY_TASKS);
                      })
                    }
                  >
                    Принять
                  </Button>
                </Stack>
              )}
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};
