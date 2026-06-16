import { MoreVert, Whatshot } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Rating,
  Stack,
  Typography,
  type Theme,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { usePostApplicationsQuery } from '@/entities/application';
import { POST_STATUS_ENUM } from '@/entities/post';
import { getUserName, useGetUserByIdQuery } from '@/entities/user';
import { ROUTES, ShareButton } from '@/shared/index';
import { Media } from '@/widgets';

import { useActions } from '../model/hooks/useActions';

import { Action } from './Action';

import type { PostItemProps } from '../model/types';

const PostItem = ({
  post,
  permissions = [],
  isMyPost = false,
  isCompact = false,
  isFavorite = false,
  isApplied = false,
  applicationId,
  applicationStatus,
  removePostFromCollection,
}: PostItemProps) => {
  const navigate = useNavigate();

  const { allowedActions, handleAction } = useActions({
    permissions,
    id: post.id,
  });

  // Заменить на легковесный запрос(имя, рейтинг, количество отзывов)
  const { data: user } = useGetUserByIdQuery(post.ownerId);

  const { data: postApplications } = usePostApplicationsQuery(post.id, {
    page: 1,
    limit: 20,
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const mediaItems =
    post?.media?.map(({ url, mimeType }) => ({
      url,
      mimeType,
    })) ?? [];

  const isWithdraw = applicationStatus === POST_STATUS_ENUM.WITHDRAWN;

  const getBorderColor = (theme: Theme) => {
    if (isWithdraw) return theme.palette.secondary.main;
    if (isApplied) return theme.palette.primary.main;
    return theme.palette.secondary.main;
  };

  return (
    <Link
      target="_blank"
      to={`${ROUTES.POST}/${post.id}`}
      style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
    >
      <Box
        sx={{
          gap: 2,
          width: '100%',
          display: 'flex',
          bgcolor: 'white',
          cursor: 'pointer',
          p: { xs: 3, lg: 4 },
          borderRadius: '32px',
          transition: 'all 0.3s ease',
          flexDirection: { xs: 'column', lg: 'row' },
          border: theme => `1px solid ${theme.palette.secondary.main}`,
          borderLeft: theme =>
            isApplied
              ? `4px solid ${getBorderColor(theme)}`
              : `1px solid ${theme.palette.secondary.main}`,
        }}
      >
        {mediaItems.length > 0 && (
          <Box
            sx={{
              width: { xs: '100%', md: isCompact ? '400px' : '500px' },
              height: { xs: '400px', md: isCompact ? '350px' : '450px' },
            }}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Media items={mediaItems} />
          </Box>
        )}

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'start',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'start',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Typography variant="h6">{post?.title}</Typography>

                  {post?.urgent && <Whatshot color="error" />}

                  {isMyPost && (
                    <Chip
                      size="small"
                      color="primary"
                      onClick={e => {
                        e.preventDefault();
                        navigate(`${ROUTES.POST}/${post.id}?tab=1`);
                      }}
                      label={`${postApplications?.items?.length} отклик`}
                    />
                  )}
                </Stack>

                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {post?.chips?.map(chip => (
                    <Chip
                      size="small"
                      key={chip}
                      label={chip}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ShareButton
                  postId={post.id}
                  title={post.title}
                />

                <IconButton onClick={handleClick}>
                  <MoreVert />
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                >
                  {allowedActions.map(action => (
                    <MenuItem
                      key={action.key}
                      onClick={e => {
                        e.preventDefault();
                        handleAction(action.key);
                        handleClose();
                      }}
                    >
                      {action.label}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Link
                target="_blank"
                to={`${ROUTES.PROFILE}?userId=${post?.ownerId}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Typography variant="h6">{getUserName(user?.data)}</Typography>
              </Link>

              <Rating
                readOnly
                value={4.5}
                precision={0.5}
              />

              <Typography
                variant="body1"
                sx={{ mt: 4, maxWidth: 700 }}
              >
                {isCompact
                  ? post?.description.slice(0, 200) + '... '
                  : post?.description}

                {isCompact && post?.description?.length > 200 && (
                  <span
                    onClick={e => {
                      e.preventDefault();
                      navigate(`${ROUTES.POST}/${post.id}`);
                    }}
                    style={{
                      color: BASE_COLOR,
                      cursor: 'pointer',
                    }}
                  >
                    Подробнее
                  </span>
                )}
              </Typography>

              {/* // TODO: Add location !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
              {typeof item === 'number' && item % 2 === 0 && (
                <Typography
                  variant="body1"
                  sx={{ mt: 4 }}
                >
                  Moscow, Russia
                </Typography>
              )} */}
            </Box>
          </Box>

          {!isMyPost && (
            <Action
              postId={post.id}
              ownerId={post.ownerId}
              isFavorite={isFavorite}
              isApplied={isApplied}
              applicationId={applicationId}
              applicationStatus={applicationStatus}
              removePostFromCollection={removePostFromCollection}
            />
          )}
        </Box>
      </Box>
    </Link>
  );
};

export default PostItem;
