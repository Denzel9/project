import { AccessTime, ChatBubbleOutlined, Update } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
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
import { MediaItem } from '@/widgets/media/ui/MediaItem';

type IncomingApplicationItemProps = {
  application: Application;
};

const getStatusColor = (status: Application['status']) => {
  if (status === APPLICATION_STATUS_ENUM.ACCEPTED) return 'success';
  if (status === APPLICATION_STATUS_ENUM.REJECTED) return 'error';
  if (status === APPLICATION_STATUS_ENUM.WITHDRAWN) return 'default';
  if (status === APPLICATION_STATUS_ENUM.VIEWED) return 'info';
  return 'primary';
};

const getStatusAccentColor = (status: Application['status']) => {
  if (status === APPLICATION_STATUS_ENUM.ACCEPTED) return 'success.main';
  if (status === APPLICATION_STATUS_ENUM.REJECTED) return 'error.main';
  if (status === APPLICATION_STATUS_ENUM.WITHDRAWN) return 'grey.400';
  if (status === APPLICATION_STATUS_ENUM.VIEWED) return 'info.main';
  return 'primary.main';
};

const isGalleryMedia = (mimeType: string) =>
  mimeType.startsWith('image/') || mimeType.startsWith('video/');

export const IncomingApplicationItem = ({
  application,
}: IncomingApplicationItemProps) => {
  const [isOpenRejectDialog, setIsOpenRejectDialog] = useState(false);

  const { setSnackbarOpen } = useSnackbarStore();
  const navigate = useNavigate();

  const { mutateAsync: updateStatus, isPending } =
    useUpdateApplicationStatusMutation();

  const post = application.post;
  const postMedia = post?.media ?? [];
  const previewMedia = postMedia.find(item => isGalleryMedia(item.mimeType));
  const isUpdated = application.createdAt !== application.updatedAt;
  const canRespond =
    application.status === APPLICATION_STATUS_ENUM.NEW ||
    application.status === APPLICATION_STATUS_ENUM.VIEWED;

  const handleAccept = async () => {
    await updateStatus({
      id: application.id,
      body: { status: APPLICATION_STATUS_ENUM.ACCEPTED },
    });
    setSnackbarOpen?.(
      true,
      'Задача создана и переведена в статус «Подготовка»'
    );
  };

  return (
    <>
      <Stack
        sx={{
          height: '100%',
          overflow: 'hidden',
          bgcolor: 'white',
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          borderLeftWidth: 4,
          borderLeftColor: getStatusAccentColor(application.status),
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          ':hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        {previewMedia && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 120,
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            <MediaItem
              src={previewMedia.url}
              alt={post?.title ?? 'Объявление'}
              mimeType={previewMedia.mimeType}
            />

            <Box
              sx={{
                top: 10,
                left: 10,
                position: 'absolute',
              }}
            >
              <Chip
                size="small"
                label={APPLICATION_STATUS_LABELS[application.status]}
                color={getStatusColor(application.status)}
              />
            </Box>
          </Box>
        )}

        <Stack
          sx={{
            p: 2,
            flex: 1,
            minHeight: 0,
            justifyContent: 'space-between',
          }}
        >
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Stack
                direction="row"
                spacing={1.25}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  cursor: 'pointer',
                  alignItems: 'start',
                }}
                onClick={() =>
                  application.applicant?.id &&
                  navigate(
                    `${ROUTES.PROFILE}?userId=${application.applicant.id}`
                  )
                }
              >
                <Avatar
                  src={application.applicant?.avatar ?? undefined}
                  sx={{ width: 44, height: 44, flexShrink: 0 }}
                />

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600, lineHeight: 1.3 }}
                  noWrap
                >
                  {getApplicantName(application.applicant)}
                </Typography>
                {/* TODO add something like company name */}
              </Stack>

              {!previewMedia && (
                <Chip
                  size="small"
                  label={APPLICATION_STATUS_LABELS[application.status]}
                  color={getStatusColor(application.status)}
                  sx={{ flexShrink: 0 }}
                />
              )}
            </Stack>

            <Link
              to={`${ROUTES.POST}/${post?.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  transition: 'color 0.2s ease',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {post?.title ?? 'Объявление'}
              </Typography>
            </Link>

            {application.message && (
              <Box
                sx={{
                  px: 1.5,
                  py: 1.25,
                  borderRadius: '14px',
                  bgcolor: 'grey.50',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  Сообщение
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                  }}
                >
                  {application.message}
                </Typography>
              </Box>
            )}

            <Stack
              spacing={1}
              direction="row"
              sx={{ alignItems: 'end' }}
            >
              <Tooltip title="Дата создания отклика">
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{ alignItems: 'end' }}
                >
                  <AccessTime color="disabled" />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ cursor: 'default' }}
                  >
                    {format(
                      new Date(application.createdAt),
                      'dd MMM yyyy, HH:mm',
                      {
                        locale: ru,
                      }
                    )}
                  </Typography>
                </Stack>
              </Tooltip>

              {isUpdated && (
                <Tooltip title="Дата последнего обновления отклика">
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: 'end' }}
                  >
                    <Update color="disabled" />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ cursor: 'default' }}
                    >
                      {formatDistanceToNow(new Date(application.updatedAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </Typography>
                  </Stack>
                </Tooltip>
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
            ></Typography>
          </Stack>

          {(canRespond ||
            application.status === APPLICATION_STATUS_ENUM.ACCEPTED) && (
            <Box sx={{ flexShrink: 0, pt: 1.5 }}>
              <Divider sx={{ mb: 1.5 }} />

              <Stack
                direction="row"
                spacing={0.75}
                sx={{ flexWrap: 'wrap', gap: 0.75 }}
              >
                {canRespond && (
                  <>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      disabled={isPending}
                      onClick={() => setIsOpenRejectDialog(true)}
                    >
                      Отклонить
                    </Button>

                    <Button
                      size="small"
                      color="success"
                      variant="outlined"
                      disabled={isPending}
                      onClick={() => void handleAccept()}
                    >
                      Принять
                    </Button>
                  </>
                )}

                {application.status === APPLICATION_STATUS_ENUM.ACCEPTED && (
                  // TODO: bag redirect to task page
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      component={Link}
                      to={`${ROUTES.TASK}/${post?.id}?inviteId=${application.id}`}
                    >
                      В задачу
                    </Button>

                    {application.applicant?.id && (
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        startIcon={<ChatBubbleOutlined sx={{ fontSize: 16 }} />}
                        to={`${ROUTES.CHAT}?recipientId=${application.applicant.id}`}
                      >
                        Чат
                      </Button>
                    )}
                  </>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
      </Stack>

      <ConfirmDialog
        title="Отклонить отклик"
        isOpen={isOpenRejectDialog}
        onClose={() => setIsOpenRejectDialog(false)}
        onSuccess={() => {
          void updateStatus({
            id: application.id,
            body: { status: APPLICATION_STATUS_ENUM.REJECTED },
          }).then(() => {
            setIsOpenRejectDialog(false);
            setSnackbarOpen?.(true, 'Отклик отклонён');
          });
        }}
        description="Вы уверены, что хотите отклонить отклик?"
      />
    </>
  );
};
