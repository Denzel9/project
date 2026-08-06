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
  USER_ROLE,
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

  return (
    <Box
      sx={{
        gap: 3,
        bgcolor: 'white',
        display: 'flex',
        p: { xs: 2, md: 4 },
        flexDirection: 'column',
        borderRadius: { xs: '16px', md: '32px' },
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
            }}
          >
            <Media items={mediaItems} />
          </Box>
        )}

        <Box sx={{ flex: 1, position: 'relative' }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Stack
              spacing={1}
              direction="row"
              sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
            >
              <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                {post?.title}
              </Typography>

              {post?.urgent && (
                <Chip
                  color="error"
                  icon={<Whatshot />}
                  label="Срочно"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={1}
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
                        `${ROUTES.MANAGE_APPLICATION}?id=${post?.id ?? ''}`
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

          <Box sx={{ width: { xs: '100%', md: '90%' } }}>
            <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
              {post?.chips?.map(chip => (
                <Chip
                  key={chip}
                  label={chip}
                />
              ))}
            </Box>

            <Stack
              component={Link}
              to={`${ROUTES.PROFILE}?userId=${user?.id}`}
              target="_blank"
              spacing={1}
              sx={{
                mt: 6,
                color: 'inherit',
                cursor: 'pointer',
                width: 'fit-content',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                ':hover': {
                  color: 'primary.main',
                },
              }}
              direction="row"
            >
              <UserDisplayName
                user={user}
                variant="subtitle1"
              />
            </Stack>

            <UserStatsRow
              followers={user?.followers}
              completedTasksCount={user?.completedTasksCount}
              sx={{ mt: 0.5 }}
            />

            <Typography
              variant="body1"
              sx={{ mt: 6, whiteSpace: 'pre-wrap' }}
            >
              {post?.description}
            </Typography>
          </Box>

          {!isOwner && (
            <Action
              postId={post?.id ?? ''}
              ownerId={post?.owner?.id ?? ''}
              applicationId={application?.id}
              isApplied={Boolean(application)}
              applicationStatus={application?.status}
              isCompany={user?.role === USER_ROLE.COMPANY}
              isFavorite={favoritePostIds.has(post?.id ?? '')}
              removePostFromCollection={removePostFromCollection}
            />
          )}
        </Box>
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
