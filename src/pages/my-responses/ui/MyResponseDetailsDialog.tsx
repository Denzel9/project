import {
  AccessTime,
  ChatBubbleOutlined,
  Close,
  InfoOutlined,
  OpenInNew,
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
import { useState } from 'react';
import { Link } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { getUserName, UserDisplayName, type User } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { WithdrawDialog } from '@/widgets/post-item/ui/WithdrawDialog';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

type MyResponseDetailsDialogProps = {
  open: boolean;
  application: Application;
  taskId?: string | null;
  withdrawingId?: string | null;
  onClose: () => void;
  onWithdraw: (applicationId: string) => void;
};

const getStatusColor = (status: Application['status']) => {
  if (status === APPLICATION_STATUS_ENUM.ACCEPTED) return 'success';
  if (status === APPLICATION_STATUS_ENUM.REJECTED) return 'error';
  if (status === APPLICATION_STATUS_ENUM.WITHDRAWN) return 'default';
  if (status === APPLICATION_STATUS_ENUM.VIEWED) return 'info';
  return 'primary';
};

const getStatusHint = (status: Application['status']) => {
  switch (status) {
    case APPLICATION_STATUS_ENUM.NEW:
      return 'Ожидает просмотра компанией';
    case APPLICATION_STATUS_ENUM.VIEWED:
      return 'Компания просмотрела отклик';
    case APPLICATION_STATUS_ENUM.ACCEPTED:
      return 'Можно перейти к задаче и написать в чат';
    case APPLICATION_STATUS_ENUM.REJECTED:
      return 'Повторный отклик на это объявление недоступен';
    case APPLICATION_STATUS_ENUM.WITHDRAWN:
      return 'Вы отозвали отклик';
    default:
      return '';
  }
};

const isGalleryMedia = (mimeType: string) =>
  mimeType.startsWith('image/') || mimeType.startsWith('video/');

export const MyResponseDetailsDialog = ({
  open,
  application,
  taskId = null,
  withdrawingId = null,
  onClose,
  onWithdraw,
}: MyResponseDetailsDialogProps) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const isWithdrawing = withdrawingId === application.id;

  const post = application.post;
  const postMedia = post?.media ?? [];
  const previewMedia = postMedia.find(item => isGalleryMedia(item.mimeType));
  const companyUser = post?.owner as Partial<User> | undefined;
  const companyName = getUserName(companyUser);
  const isUpdated = application.createdAt !== application.updatedAt;
  const statusHint = getStatusHint(application.status);
  const canWithdraw = application.status === APPLICATION_STATUS_ENUM.NEW;
  const isAccepted = application.status === APPLICATION_STATUS_ENUM.ACCEPTED;

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
                  src={companyUser?.avatar ?? undefined}
                  sx={{
                    width: 72,
                    height: 72,
                    border: '3px solid',
                    borderColor: 'info.light',
                  }}
                >
                  {companyName?.slice(0, 1)}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 700 }}
                    >
                      Ваш отклик
                    </Typography>
                    <Chip
                      size="small"
                      label={APPLICATION_STATUS_LABELS[application.status]}
                      color={getStatusColor(application.status)}
                    />
                  </Stack>

                  {companyName && (
                    <UserDisplayName
                      user={companyUser}
                      variant="body2"
                    />
                  )}

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
                        spacing={0.5}
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
                  </Stack>
                </Box>
              </Stack>

              {post?.ownerId && (
                <Button
                  variant="outlined"
                  component={Link}
                  to={`${ROUTES.PROFILE}?userId=${post.ownerId}`}
                  onClick={onClose}
                  endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                  sx={{
                    alignSelf: { xs: 'stretch', md: 'center' },
                    flexShrink: 0,
                  }}
                >
                  Компания
                </Button>
              )}
            </Stack>

            {statusHint && (
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: '20px',
                  bgcolor: 'common.white',
                  border: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'center',
                }}
              >
                <InfoOutlined sx={{ fontSize: 18, color: 'info.main' }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  {statusHint}
                </Typography>
              </Stack>
            )}

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
                  {application.message?.trim() || 'Вы не оставили сообщение'}
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

            {(canWithdraw || isAccepted) && (
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
                {canWithdraw && (
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={isWithdrawing}
                    onClick={() => setIsWithdrawOpen(true)}
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
                    Отозвать
                  </Button>
                )}

                {isAccepted && (
                  <>
                    {taskId && (
                      <Button
                        variant="contained"
                        component={Link}
                        to={`${ROUTES.TASK}/${post?.id}?inviteId=${taskId}`}
                        onClick={onClose}
                        sx={{ flex: { xs: 1, sm: 'none' } }}
                      >
                        К задаче
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      component={Link}
                      startIcon={<ChatBubbleOutlined sx={{ fontSize: 16 }} />}
                      to={`${ROUTES.CHAT}?recipientId=${post?.ownerId ?? ''}`}
                      onClick={onClose}
                      sx={{ flex: { xs: 1, sm: 'none' } }}
                    >
                      В чат
                    </Button>
                  </>
                )}
              </Stack>
            )}
          </Stack>
        </Box>
      </Dialog>

      <WithdrawDialog
        open={isWithdrawOpen}
        isPending={isWithdrawing}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={() => {
          onWithdraw(application.id);
          setIsWithdrawOpen(false);
          onClose();
        }}
      />
    </>
  );
};
