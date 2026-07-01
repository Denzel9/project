import {
  ChatBubbleOutlined,
  InfoOutlined,
  ScheduleOutlined,
  UpdateOutlined,
} from '@mui/icons-material';
import { Box, Button, Chip, Divider, Stack, Typography } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import {
  APPLICATION_STATUS_LABELS,
  type Application,
} from '@/entities/application';
import { APPLICATION_STATUS_ENUM } from '@/entities/application/model/utils';
import { getUserName, type User } from '@/entities/user';
import { ROUTES } from '@/shared/config/routes';
import { FavoriteButton } from '@/widgets';
import { MediaItem } from '@/widgets/media/ui/MediaItem';
import { WithdrawDialog } from '@/widgets/post-item/ui/WithdrawDialog';

type MyResponseItemProps = {
  isFavorite?: boolean;
  withdrawingId?: string | null;
  application: Application;
  taskId?: string | null;
  onWithdraw: (applicationId: string) => void;
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

type MetaRowProps = {
  icon: ReactNode;
  label: string;
  value: string;
};

const MetaRow = ({ icon, label, value }: MetaRowProps) => (
  <Stack
    direction="row"
    spacing={1.25}
    sx={{ alignItems: 'flex-start' }}
  >
    <Box
      sx={{
        mt: 0.25,
        color: 'text.secondary',
        display: 'flex',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mt: 0.25, lineHeight: 1.4 }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

export const MyResponseItem = ({
  onWithdraw,
  application,
  taskId,
  isFavorite = false,
  withdrawingId = null,
}: MyResponseItemProps) => {
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const isWithdrawing = withdrawingId === application.id;

  const post = application.post;
  const postMedia = post?.media ?? [];
  const previewMedia = postMedia.find(item => isGalleryMedia(item.mimeType));
  const companyName = getUserName(post?.owner as Partial<User>);
  const isUpdated = application.createdAt !== application.updatedAt;
  const statusHint = getStatusHint(application.status);

  const handleConfirmWithdraw = () => {
    onWithdraw(application.id);
    setIsWithdrawOpen(false);
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
          transition: 'box-shadow 0.2s ease',
          ':hover': {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {previewMedia && (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 140,
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
                top: 12,
                left: 12,
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
            <Box sx={{ minWidth: 0, flex: 1 }}>
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

              {companyName && (
                <Link
                  to={`${ROUTES.PROFILE}?userId=${post?.ownerId}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {companyName}
                  </Typography>
                </Link>
              )}
            </Box>

            {!previewMedia && (
              <Chip
                size="small"
                label={APPLICATION_STATUS_LABELS[application.status]}
                color={getStatusColor(application.status)}
                sx={{ flexShrink: 0 }}
              />
            )}
          </Stack>

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
                Ваш отклик
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
            <Stack spacing={1.25}>
              <MetaRow
                icon={<ScheduleOutlined sx={{ fontSize: 18 }} />}
                label="Отправлен"
                value={format(
                  new Date(application.createdAt),
                  'dd MMM yyyy, HH:mm',
                  { locale: ru }
                )}
              />

              {isUpdated && (
                <MetaRow
                  icon={<UpdateOutlined sx={{ fontSize: 18 }} />}
                  label="Обновлён"
                  value={formatDistanceToNow(new Date(application.updatedAt), {
                    addSuffix: true,
                    locale: ru,
                  })}
                />
              )}

              {statusHint && (
                <MetaRow
                  icon={<InfoOutlined sx={{ fontSize: 18 }} />}
                  label="Статус"
                  value={statusHint}
                />
              )}
            </Stack>
          </Box>
          </Stack>

          <Box sx={{ flexShrink: 0, pt: 1.5 }}>
            <Divider sx={{ mb: 1.5 }} />

            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
            <Stack
              direction="row"
              spacing={0.75}
              sx={{ flexWrap: 'wrap', gap: 0.75 }}
            >
              {application.status === APPLICATION_STATUS_ENUM.NEW && (
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  disabled={isWithdrawing}
                  onClick={() => setIsWithdrawOpen(true)}
                >
                  Отозвать
                </Button>
              )}

              {application.status === APPLICATION_STATUS_ENUM.ACCEPTED && (
                <>
                  {taskId && (
                    <Button
                      size="small"
                      component={Link}
                      variant="contained"
                      to={`${ROUTES.TASK}/${post?.id}?inviteId=${taskId}`}
                    >
                      К задаче
                    </Button>
                  )}

                  <Button
                    size="small"
                    component={Link}
                    variant="outlined"
                    startIcon={<ChatBubbleOutlined sx={{ fontSize: 16 }} />}
                    to={`${ROUTES.CHAT}?recipientId=${post?.ownerId}`}
                  >
                    В чат
                  </Button>
                </>
              )}
            </Stack>

            <FavoriteButton
              isFavorite={isFavorite}
              postId={post?.id ?? ''}
            />
            </Stack>
          </Box>
        </Stack>
      </Stack>

      <WithdrawDialog
        open={isWithdrawOpen}
        isPending={isWithdrawing}
        onClose={() => setIsWithdrawOpen(false)}
        onConfirm={handleConfirmWithdraw}
      />
    </>
  );
};
