import { MoreVert, Share, Whatshot } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { getUserName, useGetUserByIdQuery } from '@/entities/user';
import { ROUTES } from '@/shared/index';
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
}: PostItemProps) => {
  const navigate = useNavigate();

  const { allowedActions, handleAction } = useActions({
    permissions,
    id: post.id,
  });

  // Заменить на легковесный запрос(имя, рейтинг, количество отзывов)
  const { data: user } = useGetUserByIdQuery(post.ownerId);

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
    post?.media?.map(media => ({
      url: media.url,
      mimeType: media.mimeType,
    })) ?? [];

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
          cursor: 'pointer',
          p: { xs: 2, lg: 4 },
          borderRadius: '32px',
          transition: 'all 0.3s ease',
          flexDirection: { xs: 'column', lg: 'row' },
          border: theme => `1px solid ${theme.palette.secondary.main}`,
          borderLeft: theme =>
            isApplied
              ? `4px solid ${theme.palette.primary.main}`
              : `1px solid ${theme.palette.secondary.main}`,
          '&:hover': {
            bgcolor: 'secondary.light',
          },
        }}
      >
        {mediaItems.length > 0 && (
          <Box
            sx={{
              width: { xs: '100%', md: '550px' },
              height: { xs: '450px', md: '450px' },
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
                >
                  <Typography variant="h6">{post?.title}</Typography>

                  {post?.urgent && <Whatshot color="error" />}
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
                <Box>
                  <IconButton onClick={e => e.preventDefault()}>
                    <Share />
                  </IconButton>
                </Box>

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
            />
          )}
        </Box>
      </Box>
    </Link>
  );
};

export default PostItem;
