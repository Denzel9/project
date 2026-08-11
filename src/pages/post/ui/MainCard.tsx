import { Whatshot, MoreVert } from '@mui/icons-material';
import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { Link, useNavigate } from 'react-router';

import {
  UserDisplayName,
  UserStatsRow,
  useFavoritePostIds,
  type Post,
  type User,
  type Application,
} from '@/entities';
import { DeletePostDialog, useRequireEmailConfirmed } from '@/features';
import { ShareButton, ROUTES } from '@/shared';
import {
  Media,
  Action,
  useApplicationItemStore,
} from '@/widgets';

type MediaItem = {
  url: string;
  mimeType: string;
};

type MainCardProps = {
  post?: Post;
  user?: User;
  isOwner: boolean;
  mediaItems: MediaItem[];
  application?: Application;
  removePostFromCollection: (postId: string) => void;
};

export const MainCard = ({
  post,
  user,
  isOwner,
  mediaItems,
  application,
  removePostFromCollection,
}: MainCardProps) => {
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { setOpenAddToCollectionDialog } = useApplicationItemStore();

  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const { favoritePostIds } = useFavoritePostIds();

  const isCompanyPost = post?.type === 'COMPANY';
  const typeLabel = isCompanyPost ? 'Объявление' : 'Пост исполнителя';

  return (
    <Box
      sx={{
        gap: 3,
        bgcolor: 'white',
        display: 'flex',
        p: { xs: 2, md: 4 },
        flexDirection: 'column',
        borderRadius: { xs: '16px', md: '32px' },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',

          flexDirection: { xs: 'column', lg: 'row' },
          gap: 3,
        }}
      >
        {Boolean(post?.media?.length) && (
          <Box
            sx={{
              width: { xs: '100%', md: '550px' },
              height: { xs: '400px', md: '500px' },
              flexShrink: 0,
            }}
          >
            <Media items={mediaItems} />
          </Box>
        )}

        <Stack direction='column' spacing={2} sx={{ flex: 1, position: 'relative', minWidth: 0, justifyContent: 'space-between', }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'flex-start' }}
          >
            <Stack spacing={2} sx={{ minWidth: 0, flex: 1, }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
              >
                <Chip
                  size="small"
                  label={typeLabel}
                  color={isCompanyPost ? 'default' : 'primary'}
                  variant={isCompanyPost ? 'outlined' : 'filled'}
                  sx={{ fontWeight: 600 }}
                />
                {post?.urgent && (
                  <Chip
                    color="error"
                    icon={<Whatshot />}
                    label="Срочно"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>

              <Typography
                sx={{
                  fontSize: { xs: '1.5rem', md: '2.25rem' },
                  fontWeight: 600,
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {post?.title}
              </Typography>

              {Boolean(post?.chips?.length) && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {post?.chips?.map(chip => (
                    <Chip
                      key={chip}
                      label={chip}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              sx={{ flexShrink: 0 }}
            >
              <ShareButton
                postId={post?.id ?? ''}
                title={post?.title ?? ''}
              />

              <IconButton onClick={handleMenuClick}>
                <MoreVert />
              </IconButton>

              <Menu
                open={open}
                anchorEl={anchorEl}
                onClose={closeMenu}
              >
                {isOwner && (
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      if (!requireEmailConfirmed()) return;
                      navigate(
                        `${ROUTES.MANAGE_APPLICATION}?id=${post?.id ?? ''}`,
                      );
                    }}
                  >
                    Редактировать
                  </MenuItem>
                )}

                {isOwner && (
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      if (!requireEmailConfirmed()) return;
                      setIsOpenDeleteDialog(true);
                    }}
                  >
                    Удалить
                  </MenuItem>
                )}

                {!isOwner && (
                  <MenuItem
                    onClick={() => {
                      closeMenu();
                      if (!requireEmailConfirmed()) return;
                      setOpenAddToCollectionDialog(true, post?.id ?? '');
                    }}
                  >
                    Добавить в подборку
                  </MenuItem>
                )}
              </Menu>
            </Stack>
          </Stack>

          <Stack direction='column' spacing={6} sx={{ width: { xs: '100%', md: '90%' }, }}>
            <Stack direction='column' spacing={0}>
              <Typography
                target="_blank"
                component={Link}
                variant="subtitle1"
                to={`${ROUTES.PROFILE}?userId=${user?.id}`}
                sx={{
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'inline-block',
                  width: 'fit-content',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    color: 'primary.main',
                  },
                }}>
                <UserDisplayName
                  user={user}
                  variant="subtitle1"
                />
              </Typography>

              <UserStatsRow
                followers={user?.followers}
                completedTasksCount={user?.completedTasksCount}
                sx={{ mt: 0.5 }}
              />
            </Stack>

            <Typography
              variant="body1"
              sx={{ mt: 3, whiteSpace: 'pre-wrap' }}
            >
              {post?.description}
            </Typography>
          </Stack>

          {!isOwner && (
            <Action
              postId={post?.id ?? ''}
              ownerId={post?.owner?.id ?? ''}
              applicationId={application?.id}
              isApplied={Boolean(application)}
              applicationStatus={application?.status}
              isCompany={isCompanyPost}
              isFavorite={favoritePostIds.has(post?.id ?? '')}
              removePostFromCollection={removePostFromCollection}
            />
          )}
        </Stack>
      </Box>

      <DeletePostDialog
        open={isOpenDeleteDialog}
        postId={post?.id ?? null}
        onClose={() => setIsOpenDeleteDialog(false)}
        onSuccess={() => navigate(ROUTES.INDEX)}
      />
    </Box>
  );
};
