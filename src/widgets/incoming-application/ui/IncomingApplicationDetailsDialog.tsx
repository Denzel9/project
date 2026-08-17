import {
  AccessTime,
  ArticleOutlined,
  CheckCircleOutlined,
  Close,
  FavoriteBorder,
  HandshakeOutlined,
  OpenInNew,
  WorkOutlined,
  Person2Outlined,
  Update,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  getApplicationActor,
  useUpdateApplicationStatusMutation,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { applicantToUserPartial, UserDisplayName } from '@/entities/user';
import { useAuthStore } from '@/features/auth';
import { ActionActorCaption } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { ConfirmDialog } from '@/widgets/confirm-dialog';
import { MediaItem } from '@/widgets/media/ui/MediaItem';
import { useSnackbarStore } from '@/widgets/snackbar';

type IncomingApplicationDetailsDialogProps = {
  open: boolean;
  application: Application;
  onClose: () => void;
  onAccepted?: () => void;
};

const getStatusColor = (status: Application['status']) => {
  if (status === APPLICATION_STATUS_ENUM.ACCEPTED) return 'success';
  if (status === APPLICATION_STATUS_ENUM.REJECTED) return 'error';
  if (status === APPLICATION_STATUS_ENUM.WITHDRAWN) return 'default';
  if (status === APPLICATION_STATUS_ENUM.VIEWED) return 'info';
  return 'primary';
};

const isGalleryMedia = (mimeType: string) =>
  mimeType.startsWith('image/') || mimeType.startsWith('video/');

type StatProps = {
  icon: ReactNode;
  value: number;
  label: string;
  accent?: string;
  to?: string;
  onNavigate?: () => void;
};

const Stat = ({
  icon,
  value,
  label,
  accent = 'primary.main',
  to,
  onNavigate,
}: StatProps) => (
  <Stack
    spacing={1}
    {...(to
      ? {
        component: Link,
        to,
        onClick: onNavigate,
      }
      : {})}
    sx={{
      p: 2,
      height: '100%',
      minWidth: 0,
      border: '1px solid',
      borderRadius: '20px',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      justifyContent: 'space-between',
      color: 'inherit',
      textDecoration: 'none',
      ...(to && {
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        },
      }),
    }}
  >
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: accent,
          bgcolor: 'info.light',
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h5"
        color="info"
        sx={{ fontWeight: 700 }}
      >
        {value}
      </Typography>
    </Stack>

    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ lineHeight: 1.35 }}
    >
      {label}
    </Typography>
  </Stack>
);

export const IncomingApplicationDetailsDialog = ({
  open,
  application,
  onClose,
  onAccepted,
}: IncomingApplicationDetailsDialogProps) => {
  const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);
  const { setSnackbarOpen } = useSnackbarStore();
  const isPrime = useAuthStore(state => state.isPrime);
  const { mutateAsync: updateStatus, isPending } =
    useUpdateApplicationStatusMutation();

  const post = application.post;
  const postMedia = post?.media ?? [];
  const previewMedia = postMedia.find(item => isGalleryMedia(item.mimeType));
  const isUpdated = application.createdAt !== application.updatedAt;
  const actor = getApplicationActor(application);
  const canRespond =
    application.status === APPLICATION_STATUS_ENUM.NEW ||
    application.status === APPLICATION_STATUS_ENUM.VIEWED;
  const stats = application.applicantStatistics;
  const applicantId = application.applicant?.id;
  const sharedTasksHref = applicantId
    ? `${ROUTES.MY_TASKS}?executorId=${encodeURIComponent(applicantId)}`
    : undefined;
  const sharedInProgressHref = sharedTasksHref
    ? `${sharedTasksHref}&active=1`
    : undefined;
  const sharedCompletedHref = sharedTasksHref
    ? `${sharedTasksHref}&status=COMPLETED`
    : undefined;
  const sharedPublicationsHref = applicantId
    ? `${ROUTES.PUBLICATIONS}?executorId=${encodeURIComponent(applicantId)}`
    : undefined;

  useEffect(() => {
    if (!open) return;
    if (application.status !== APPLICATION_STATUS_ENUM.NEW) return;

    void updateStatus({
      id: application.id,
      body: { status: APPLICATION_STATUS_ENUM.VIEWED },
    });
  }, [open, application.id, application.status, updateStatus]);

  const handleAccept = async () => {
    await updateStatus({
      id: application.id,
      body: { status: APPLICATION_STATUS_ENUM.ACCEPTED },
    });
    setSnackbarOpen?.(
      true,
      isPrime
        ? 'Задача создана и переведена в статус «Подготовка»'
        : 'Отклик принят'
    );
    onClose();
    onAccepted?.();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        sx={{
          maxHeight: '100vh',
          '& .MuiDialog-paper': {
            m: 0,
            outline: 'none',
            maxWidth: 960,
            overflow: 'visible',
            position: 'relative',
            bgcolor: 'secondary.light',
            width: { xs: '100%', md: 960 },
            borderRadius: { xs: 0, md: '24px' },
            height: { xs: '100%', md: 'auto' },
            maxHeight: { xs: '100%', md: 'auto' },
          },
        }}
      >
        <IconButton
          onClick={onClose}
          color="primary"
          aria-label="Закрыть"
          sx={{
            top: { xs: 8, md: 0 },
            right: { xs: 8, sm: -60 },
            position: 'absolute',
            bgcolor: 'secondary.main',
            zIndex: 1,
            ':hover': {
              bgcolor: 'background.paper',
            },
          }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            p: 2,
            mt: { xs: 5, md: 0 },
            overflow: 'auto',
            scrollbarWidth: 'none',
            maxHeight: { xs: '100%', md: 'calc(100vh - 48px)' },
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: '28px',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', minWidth: 0 }}
              >
                <Avatar
                  src={application.applicant?.avatar ?? undefined}
                  sx={{
                    width: 72,
                    height: 72,
                    border: '3px solid',
                    borderColor: 'info.light',
                  }}
                />

                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <UserDisplayName
                      user={applicantToUserPartial(application.applicant)}
                      variant="h6"
                    />
                    <Chip
                      size="small"
                      label={APPLICATION_STATUS_LABELS[application.status]}
                      color={getStatusColor(application.status)}
                    />
                  </Stack>

                  <Stack
                    spacing={1}
                    direction="row"
                    sx={{ mt: 1, alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center' }}
                    >
                      <AccessTime sx={{ fontSize: 15, color: 'info.main' }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {format(
                          new Date(application.createdAt),
                          'dd MMM yyyy, HH:mm',
                          { locale: ru }
                        )}
                      </Typography>
                    </Stack>

                    {isUpdated && (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ alignItems: 'center' }}
                      >
                        <Update sx={{ fontSize: 15, color: 'info.main' }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          обновлён{' '}
                          {formatDistanceToNow(new Date(application.updatedAt), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </Typography>
                      </Stack>
                    )}

                    {actor && (
                      <ActionActorCaption
                        actor={actor}
                        direction="row"
                        withKind={false}
                        icon={
                          <Person2Outlined
                            sx={{ fontSize: 15, color: 'info.main' }}
                          />
                        }
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>

              {application.applicant?.id && (
                <Button
                  variant="outlined"
                  component={Link}
                  to={`${ROUTES.PROFILE}?userId=${application.applicant.id}`}
                  onClick={onClose}
                  endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                  sx={{
                    alignSelf: { xs: 'stretch', md: 'center' },
                    flexShrink: 0,
                  }}
                >
                  Профиль
                </Button>
              )}
            </Stack>

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, ml: 2, mt: 1, color: 'text.secondary' }}
              >
                Статистика кандидата
              </Typography>

              <Grid
                container
                spacing={1}
              >
                <Grid size={{ xs: 6, md: 4 }}>
                  <Stat
                    icon={<FavoriteBorder fontSize="small" />}
                    value={stats?.favoritedByCount ?? 0}
                    label="Добавили в избранное"
                    accent="primary.main"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Stat
                    icon={<ArticleOutlined fontSize="small" />}
                    value={stats?.totalPublications ?? 0}
                    label="Публикаций всего"
                    accent="success.main"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Stat
                    icon={<CheckCircleOutlined fontSize="small" />}
                    value={stats?.completedWorks ?? 0}
                    label="Выполненных задач всего"
                    accent="info.main"
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Stat
                    icon={<WorkOutlined fontSize="small" />}
                    value={stats?.sharedInProgressWorks ?? 0}
                    label="Совместных задач в работе"
                    accent="warning.main"
                    to={sharedInProgressHref}
                    onNavigate={onClose}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Stat
                    icon={<ArticleOutlined fontSize="small" />}
                    value={stats?.sharedPublications ?? 0}
                    label="Совместных публикаций"
                    accent="warning.main"
                    to={sharedPublicationsHref}
                    onNavigate={onClose}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 4 }}>
                  <Stat
                    icon={<HandshakeOutlined fontSize="small" />}
                    value={stats?.sharedCompletedWorks ?? 0}
                    label="Совместных выполненных задач"
                    accent="info.main"
                    to={sharedCompletedHref}
                    onNavigate={onClose}
                  />
                </Grid>
              </Grid>
            </Box>

            <Stack
              spacing={1}
              sx={{ alignItems: { xs: 'stretch', md: 'start' } }}
              direction={{ xs: 'column', md: 'row' }}
            >
              <Box
                sx={{
                  p: 2.5,
                  flex: 1.4,
                  minWidth: 0,
                  borderRadius: '28px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Сопроводительное письмо
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.65,
                    color: application.message?.trim()
                      ? 'text.primary'
                      : 'text.secondary',
                  }}
                >
                  {application.message?.trim() ||
                    'Кандидат не оставил сообщение'}
                </Typography>
              </Box>

              {post && (
                <Box
                  sx={{
                    p: 2,
                    flex: 1,
                    flexGrow: 1,
                    borderRadius: '28px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                  >
                    Объявление
                  </Typography>

                  {previewMedia && (
                    <Box
                      sx={{
                        width: '100%',
                        height: 140,
                        borderRadius: '18px',
                        overflow: 'hidden',
                        bgcolor: 'secondary.light',
                      }}
                    >
                      <MediaItem
                        src={previewMedia.url}
                        alt={post?.title ?? 'Объявление'}
                        mimeType={previewMedia.mimeType}
                      />
                    </Box>
                  )}

                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post?.title ?? 'Объявление'}
                  </Typography>

                  {post?.id && (
                    <Button
                      size="small"
                      variant="text"
                      component={Link}
                      to={`${ROUTES.POST}/${post.id}`}
                      onClick={onClose}
                      endIcon={<OpenInNew sx={{ fontSize: 14 }} />}
                      sx={{ alignSelf: 'flex-start', px: 0 }}
                    >
                      Открыть объявление
                    </Button>
                  )}
                </Box>
              )}
            </Stack>

            {(canRespond ||
              application.status === APPLICATION_STATUS_ENUM.ACCEPTED) && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    gap: 1,
                    p: 2,
                    flexWrap: 'wrap',
                    borderRadius: '24px',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    justifyContent: { xs: 'stretch', sm: 'flex-end' },
                  }}
                >
                  {canRespond && (
                    <>
                      <Button
                        color="error"
                        variant="outlined"
                        disabled={isPending}
                        onClick={() => setIsOpenRejectDialog(true)}
                        sx={{ flex: { xs: 1, sm: 'none' } }}
                      >
                        Отклонить
                      </Button>

                      <Button
                        color="success"
                        variant="contained"
                        disabled={isPending}
                        onClick={() => void handleAccept()}
                        sx={{ flex: { xs: 1, sm: 'none' } }}
                      >
                        Принять
                      </Button>
                    </>
                  )}

                  {application.status === APPLICATION_STATUS_ENUM.ACCEPTED && (
                    <>
                      {isPrime && (
                        <Button
                          variant="outlined"
                          component={Link}
                          to={`${ROUTES.TASK}/${post?.id}?userId=${application.applicant?.id ?? ''}`}
                          onClick={onClose}
                        >
                          В задачу
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        component={Link}
                        to={`${ROUTES.CHATS}?recipientId=${application.applicant?.id ?? ''}`}
                        onClick={onClose}
                      >
                        Чат
                      </Button>
                    </>
                  )}
                </Stack>
              )}
          </Stack>
        </Box>
      </Dialog>

      <ConfirmDialog
        title="Отклонить отклик"
        isOpen={isOpenRejectDialog}
        isPending={isPending}
        onClose={() => setIsOpenRejectDialog(false)}
        onSuccess={() => {
          void updateStatus({
            id: application.id,
            body: { status: APPLICATION_STATUS_ENUM.REJECTED },
          }).then(() => {
            setIsOpenRejectDialog(false);
            setSnackbarOpen?.(true, 'Отклик отклонён');
            onClose();
          });
        }}
        description="Вы уверены, что хотите отклонить отклик?"
      />
    </>
  );
};
