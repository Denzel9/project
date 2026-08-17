import { MoreVert, Whatshot } from '@mui/icons-material';
import {
  Box,
  Checkbox,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  type Theme,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import { BASE_COLOR } from '@/app/index';
import { usePostApplicationsQuery } from '@/entities/application';
import { getApplicationsCountLabel, POST_STATUS_ENUM, formatPostLocation } from '@/entities/post';
import { UserDisplayName, UserStatsRow, type User } from '@/entities/user';
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
  isPrivate = false,
  applicationStatus,
  isFavorite = false,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelect,
  onEnterSelectionMode,
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
    e.stopPropagation();
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

  const handleSelectClick = () => {
    if (!isSelectionMode) return;
    onToggleSelect?.();
  };

  const preventNavigationInSelection = (
    event: MouseEvent<HTMLElement>
  ) => {
    if (!isSelectionMode) return;
    event.preventDefault();
  };

  return (
    <Box
      onClick={handleSelectClick}
      sx={{
        gap: 2,
        width: '100%',
        display: 'flex',
        bgcolor: isSelected ? 'action.hover' : 'background.paper',
        p: { md: 4 },
        borderRadius: '24px',
        transition: 'all 0.3s ease',
        flexDirection: { xs: 'column', lg: 'row' },
        border: '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        cursor: isSelectionMode ? 'pointer' : 'default',
        borderLeft: theme =>
          isApplied
            ? `4px solid ${getBorderColor(theme)}`
            : `1px solid ${
                isSelected
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main
              }`,
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
          p: { xs: 2, md: 0 },
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
                  component={Link}
                  to={`${ROUTES.POST}/${post.id}`}
                  onClick={preventNavigationInSelection}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    ':hover': {
                      color: 'primary.main',
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
                      if (isSelectionMode) return;
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
              {!isSelectionMode && !isPrivate && (
                <ShareButton
                  postId={post.id}
                  title={post.title}
                />
              )}

              {isSelectionMode ? (
                <Box
                  component="span"
                  onClick={event => event.stopPropagation()}
                  onMouseDown={event => event.stopPropagation()}
                >
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    onChange={() => onToggleSelect?.()}
                    slotProps={{
                      input: {
                        'aria-label': isSelected
                          ? 'Снять выбор с объявления'
                          : 'Выбрать объявление',
                      },
                    }}
                  />
                </Box>
              ) : (
                <>
                  <IconButton onClick={handleClick}>
                    <MoreVert />
                  </IconButton>

                  <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                  >
                    {isMyPost && onEnterSelectionMode && (
                      <>
                        <MenuItem
                          sx={{ fontSize: 14 }}
                          onClick={() => {
                            onEnterSelectionMode();
                            handleClose();
                          }}
                        >
                          Выбрать
                        </MenuItem>
                        {allowedActions.length > 0 && <Divider />}
                      </>
                    )}

                    {allowedActions.map((action, index) => (
                      <>
                        <MenuItem
                          key={action.key}
                          sx={{ fontSize: 14 }}
                          onClick={() => {
                            handleAction(action.key);
                            handleClose();
                          }}
                        >
                          {action.label}
                        </MenuItem>
                        {index < allowedActions.length - 1 && (
                          <Divider key={action.key} />
                        )}
                      </>
                    ))}
                  </Menu>
                </>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography
              target="_blank"
              component={Link}
              to={`${ROUTES.PROFILE}?userId=${post?.owner?.id}`}
              onClick={preventNavigationInSelection}
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
              <UserDisplayName
                user={post?.owner as Partial<User>}
                variant="subtitle1"
              />
            </Typography>

            <UserStatsRow
              followers={post?.owner?.followers}
              completedTasksCount={post?.owner?.completedTasksCount}
              sx={{ mt: 0.5 }}
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
                  onClick={() => {
                    if (isSelectionMode) return;
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

            {(() => {
              const locationLabel = formatPostLocation(post.location)
              if (!locationLabel || locationLabel === '—') return null

              return (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {locationLabel}
                </Typography>
              )
            })()}
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
