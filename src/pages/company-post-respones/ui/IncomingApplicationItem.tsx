import { AccessTime, Person2Outlined, Update } from '@mui/icons-material';
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

import { IncomingApplicationDetailsDialog } from './IncomingApplicationDetailsDialog';

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

const isGalleryMedia = (mimeType: string) =>
  mimeType.startsWith('image/') || mimeType.startsWith('video/');

export const IncomingApplicationItem = ({
  application,
}: IncomingApplicationItemProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
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
        onClick={() => setIsDetailsOpen(true)}
        sx={{
          height: '100%',
          overflow: 'hidden',
          bgcolor: 'white',
          borderRadius: '24px',
          border: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
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
                top: 16,
                right: 16,
                position: 'absolute',
              }}
            >
              <Chip
                size="small"
                label={APPLICATION_STATUS_LABELS[application.status]}
                color={getStatusColor(application.status)}
                sx={{ opacity: 0.8 }}
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
                  alignItems: 'start',
                }}
              >
                <Avatar
                  src={application.applicant?.avatar ?? undefined}
                  sx={{ width: 44, height: 44, flexShrink: 0 }}
                />

                <UserDisplayName
                  user={applicantToUserPartial(application.applicant)}
                  variant="subtitle1"
                />
              </Stack>

              {!previewMedia && (
                <Chip
                  size="small"
                  label={APPLICATION_STATUS_LABELS[application.status]}
                  color={getStatusColor(application.status)}
                  sx={{ opacity: 0.8 }}
                />
              )}
            </Stack>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {post?.title ?? 'Объявление'}
            </Typography>

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

              {actor && (
                <ActionActorCaption
                  actor={actor}
                  direction="row"
                  withKind={false}
                  icon={<Person2Outlined color="disabled" />}
                />
              )}
            </Stack>
          </Stack>

          {(canRespond ||
            application.status === APPLICATION_STATUS_ENUM.ACCEPTED) && (
              <Box
                sx={{ flexShrink: 0, pt: 1.5 }}
                onClick={event => event.stopPropagation()}
              >
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
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`${ROUTES.TASK}/${post?.id}?inviteId=${application.id}`}
                      >
                        В задачу
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        component={Link}
                        to={`${ROUTES.CHAT}?recipientId=${application.applicant?.id ?? ''}`}
                      >
                        Чат
                      </Button>
                    </>
                  )}
                </Stack>
              </Box>
            )}
        </Stack>
      </Stack>

      <IncomingApplicationDetailsDialog
        open={isDetailsOpen}
        application={application}
        onClose={() => setIsDetailsOpen(false)}
      />

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
          });
        }}
        description="Вы уверены, что хотите отклонить отклик?"
      />
    </>
  );
};
