import { ChatOutlined } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  getApplicantName,
  useUpdateApplicationStatusMutation,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { ROUTES } from '@/shared/config/routes';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';

type IncomingApplicationItemProps = {
  application: Application;
};

export const IncomingApplicationItem = ({
  application,
}: IncomingApplicationItemProps) => {
  const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();

  const navigate = useNavigate();

  const { mutateAsync: updateStatus, isPending } =
    useUpdateApplicationStatusMutation();

  return (
    <Stack
      direction="column"
      sx={{
        p: 3,
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
          sx={{ alignItems: 'start', justifyContent: 'space-between', mb: 2 }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', cursor: 'pointer' }}
            onClick={() =>
              navigate(`${ROUTES.PROFILE}?userId=${application.applicant?.id}`)
            }
          >
            <Avatar
              src={application.applicant?.avatar ?? undefined}
              sx={{ width: 56, height: 56 }}
            />

            <Box>
              <Typography variant="subtitle1">
                {getApplicantName(application.applicant)}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                {new Date(application.createdAt).toLocaleDateString('ru-RU')}
              </Typography>
            </Box>
          </Stack>

          <Chip
            size="small"
            label={APPLICATION_STATUS_LABELS[application.status]}
            color={
              application.status === APPLICATION_STATUS_ENUM.ACCEPTED
                ? 'success'
                : application.status === APPLICATION_STATUS_ENUM.REJECTED
                  ? 'error'
                  : 'primary'
            }
          />
        </Stack>

        <Link
          to={`${ROUTES.POST}/${application.post?.id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 1,
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

        <Typography variant="body1">{application.message}</Typography>
      </Box>

      <Stack
        direction={{ xs: 'row-reverse', md: 'row' }}
        sx={{
          mt: 4,
          width: '100%',
          justifyContent: 'space-between',
        }}
      >
        {(application.status === APPLICATION_STATUS_ENUM.NEW ||
          application.status === APPLICATION_STATUS_ENUM.VIEWED) && (
          <Stack
            direction="row"
            spacing={4}
          >
            <Button
              size="small"
              color="error"
              disabled={isPending}
              sx={{ px: 2 }}
              onClick={() => setIsOpenRejectDialog(true)}
            >
              Отклонить
            </Button>

            <Button
              size="small"
              color="success"
              disabled={isPending}
              sx={{ px: 2 }}
              onClick={() =>
                updateStatus({
                  id: application.id,
                  body: { status: APPLICATION_STATUS_ENUM.ACCEPTED },
                }).then(() =>
                  setSnackbarOpen?.(
                    true,
                    'Задача создана и переведена в статус "Подготовка"'
                  )
                )
              }
            >
              Принять
            </Button>
          </Stack>
        )}

        {application.applicant?.id && (
          <IconButton
            size="small"
            color="primary"
            component={Link}
            to={`${ROUTES.CHAT}?recipientId=${application.applicant.id}`}
          >
            <ChatOutlined />
          </IconButton>
        )}
      </Stack>

      <ConfirmDialog
        isOpen={isOpenRejectDialog}
        onClose={() => setIsOpenRejectDialog(false)}
        onSuccess={() => {
          updateStatus({
            id: application.id,
            body: { status: APPLICATION_STATUS_ENUM.REJECTED },
          }).then(() => {
            setIsOpenRejectDialog(false);
          });
        }}
      >
        <Typography variant="h6">Отклонить отклик</Typography>
        <Typography variant="body1">
          Вы уверены, что хотите отклонить отклик?
        </Typography>
      </ConfirmDialog>
    </Stack>
  );
};
