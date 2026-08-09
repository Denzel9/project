import {
  AccessTime,
  ArticleOutlined,
  CancelOutlined,
  CheckCircleOutlined,
  Close,
  FavoriteBorder,
  HandshakeOutlined,
  OpenInNew,
  Person2Outlined,
  Update,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
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
import { ActionActorCaption } from '@/shared';
import { ROUTES } from '@/shared/config/routes';
import { ConfirmDialog, useSnackbarStore } from '@/widgets';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

type IncomingApplicationDetailsDialogProps = {
  open: boolean;
  application: Application;
  onClose: () => void;
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

type StatItemProps = {
  icon: ReactNode;
  value: number;
  label: string;
  accent?: string;
};

const StatItem = ({ icon, value, label, accent = 'primary.main' }: StatItemProps) => (
  <Stack
    spacing={1}
    sx={{
      flex: '1 1 140px',
      minWidth: 0,
      p: 2,
      borderRadius: '20px',
      bgcolor: 'common.white',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
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
      sx={{ fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.03em' }}
    >
      {value}
    </Typography>
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
}: IncomingApplicationDetailsDialogProps) => {
  const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);
  const { setSnackbarOpen } = useSnackbarStore();
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
  const showStatistics =
    application.attachStatistics !== false &&
    Boolean(application.applicantStatistics);
  const stats = application.applicantStatistics;

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
      'Задача создана и переведена в статус «Подготовка»'
    );
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        sx={{
          maxHeight: '100vh',
          '& .MuiDialog-paper': {
            outline: 'none',
            maxWidth: 960,
            m: { xs: 2, sm: 4 },
            overflow: 'visible',
            position: 'relative',
            borderRadius: '32px',
            width: { xs: '100%', sm: 960 },
            bgcolor: 'secondary.light',
          },
        }}
      >
        <IconButton
          onClick={onClose}
          color="primary"
          aria-label="Закрыть"
          sx={{
            top: 0,
            right: { xs: 8, sm: -60 },
            position: 'absolute',
            bgcolor: 'secondary.main',
            zIndex: 1,
            ':hover': {
              bgcolor: 'common.white',
            },
          }}
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            overflow: 'auto',
            p: { xs: 2.5, md: 3.5 },
            maxHeight: 'calc(100vh - 48px)',
            scrollbarWidth: 'none',

          }}
        >
          <Stack spacing={1}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: '28px',
                bgcolor: 'common.white',
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
                    sx={{ alignItems: 'center', flexWrap: 'wrap', }}
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
                      <ActionActorCaption actor={actor} direction="row" withKind={false} icon={<Person2Outlined sx={{ fontSize: 15, color: 'info.main' }} />} />
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
                  sx={{ alignSelf: { xs: 'stretch', md: 'center' }, flexShrink: 0 }}
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

              {showStatistics && stats ? (
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ flexWrap: { sm: 'wrap' } }}
                >
                  <StatItem
                    icon={<CheckCircleOutlined fontSize="small" />}
                    value={stats.completedWorks}
                    label="Сделанных работ"
                    accent="success.main"
                  />
                  <StatItem
                    icon={<CancelOutlined fontSize="small" />}
                    value={stats.cancelledWorks}
                    label="Аннулированных работ"
                    accent="error.main"
                  />
                  <StatItem
                    icon={<HandshakeOutlined fontSize="small" />}
                    value={stats.sharedCompletedWorks}
                    label="Совместных выполненных задач"
                    accent="info.main"
                  />
                  <StatItem
                    icon={<ArticleOutlined fontSize="small" />}
                    value={stats.sharedPublications}
                    label="Совместных публикаций"
                    accent="warning.main"
                  />
                  <StatItem
                    icon={<FavoriteBorder fontSize="small" />}
                    value={stats.favoritedByCount}
                    label="Добавили в избранное"
                    accent="primary.main"
                  />
                </Stack>
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ px: 2, py: 1 }}
                >
                  Кандидат не прикрепил статистику к этому отклику
                </Typography>
              )}
            </Box>

            <Stack
              spacing={1}
              sx={{ alignItems: 'stretch' }}
              direction={{ xs: 'column', md: 'row' }}
            >
              <Box
                sx={{
                  p: 2.5,
                  flex: 1.4,
                  minWidth: 0,
                  borderRadius: '28px',
                  bgcolor: 'common.white',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Сообщение отклика
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
                  {application.message?.trim() || 'Кандидат не оставил сообщение'}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  flex: 1,
                  borderRadius: '28px',
                  bgcolor: 'common.white',
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
                    bgcolor: 'common.white',
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
                      <Button
                        variant="outlined"
                        component={Link}
                        to={`${ROUTES.TASK}/${post?.id}?inviteId=${application.id}`}
                        onClick={onClose}
                      >
                        В задачу
                      </Button>

                      <Button
                        variant="outlined"
                        component={Link}
                        to={`${ROUTES.CHAT}?recipientId=${application.applicant?.id ?? ''}`}
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
