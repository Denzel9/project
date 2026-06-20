import { MoreVert, RocketLaunch, Whatshot } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Rating,
  Stack,
  Tooltip,
  Typography,
  type Theme,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { usePostApplicationsQuery } from '@/entities/application';
import { getApplicationsCountLabel, POST_STATUS_ENUM } from '@/entities/post';
import { getUserName, type User } from '@/entities/user';
import { ROUTES, ShareButton } from '@/shared/index';
import { Media } from '@/widgets';

import { useActions } from '../model/hooks/useActions';

import { Action } from './Action';

import type { PostItemProps } from '../model/types';

const PostItem = ({
  post,
  applicationId,
  permissions = [],
  isMyPost = false,
  isCompany = false,
  isCompact = false,
  isApplied = false,
  applicationStatus,
  isFavorite = false,
  removePostFromCollection,
}: PostItemProps) => {
  const navigate = useNavigate();

  const { allowedActions, handleAction } = useActions({
    permissions,
    id: post.id,
  });

  const { data: postApplications } = usePostApplicationsQuery(
    post.id,
    {
      page: 1,
      limit: 20,
    },
    isMyPost
  );

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
    <Box
      sx={{
        gap: 2,
        width: '100%',
        display: 'flex',
        bgcolor: 'white',
        p: { md: 4 },
        borderRadius: '32px',
        transition: 'all 0.3s ease',
        flexDirection: { xs: 'column', lg: 'row' },
        border: theme => `1px solid ${theme.palette.secondary.main}`,
        borderLeft: theme =>
          isApplied
            ? `4px solid ${getBorderColor(theme)}`
            : `1px solid ${theme.palette.secondary.main}`,
        ':hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      {Boolean(mediaItems.length) && (
        <Box
          sx={{
            width: { xs: window.innerWidth, md: isCompact ? '400px' : '500px' },
            height: {
              xs: window.innerWidth + 66,
              md: isCompact ? '350px' : '450px',
            },
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
          p: { xs: 3, md: 0 },
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
                spacing={1}
                direction="row"
                sx={{ alignItems: 'center' }}
              >
                <Typography
                  variant="h6"
                  target="_blank"
                  component={isCompany ? Link : 'span'}
                  to={isCompany ? `${ROUTES.POST}/${post.id}` : undefined}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    cursor: isCompany ? 'pointer' : 'default',
                    ':hover': {
                      color: isCompany ? 'primary.main' : 'inherit',
                    },
                  }}
                >
                  {post?.title}
                </Typography>

                {post?.urgent && <Whatshot color="error" />}

                {isMyPost && isCompany && (
                  <Chip
                    size="small"
                    color="primary"
                    onClick={e => {
                      e.preventDefault();
                      navigate(`${ROUTES.POST}/${post.id}?tab=1`);
                    }}
                    label={getApplicationsCountLabel(
                      postApplications?.items || []
                    )}
                  />
                )}
              </Stack>

              {Boolean(post?.chips?.length) && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {post?.chips?.map(chip => (
                    <Chip
                      size="small"
                      key={chip}
                      label={chip}
                    />
                  ))}
                </Box>
              )}
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
                    onClick={() => {
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
            <Typography
              target="_blank"
              component={Link}
              to={`${ROUTES.PROFILE}?userId=${post?.owner?.id}`}
              sx={{
                gap: 1,
                display: 'flex',
                color: 'inherit',
                cursor: 'pointer',
                alignItems: 'center',
                width: 'fit-content',
                textDecoration: 'none',
                transition: 'text-decoration 0.3s ease',
                ':hover': {
                  color: 'primary.main',
                },
              }}
            >
              <Typography variant="h6">
                {getUserName(post?.owner as Partial<User>)}
              </Typography>

              <Tooltip title="Это - Prime-аккаунт">
                <RocketLaunch color="primary" />
              </Tooltip>
            </Typography>

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

              {isCompact && isCompany && post?.description?.length > 200 && (
                <span
                  onClick={() => {
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
            isCompany={isCompany}
            isApplied={isApplied}
            isFavorite={isFavorite}
            ownerId={post.owner?.id}
            applicationId={applicationId}
            applicationStatus={applicationStatus}
            removePostFromCollection={removePostFromCollection}
          />
        )}
      </Box>
    </Box>
  );
};

export default PostItem;
