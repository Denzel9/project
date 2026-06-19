import { Whatshot, NorthEast, MoreVert } from '@mui/icons-material';
import {
  Box,
  Stack,
  Typography,
  Chip,
  IconButton,
  Rating,
  Menu,
  MenuItem,
} from '@mui/material';
import { useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router';

import { useFavoritePostIds } from '@/entities/favorite';
import { getUserName } from '@/entities/user';
import { DeletePostDialog } from '@/features/delete-post';
import { ShareButton, ROUTES } from '@/shared';
import { Media } from '@/widgets';
import { Action } from '@/widgets/post-item/ui/Action';

import type { Application } from '@/entities/application';
import type { Post } from '@/entities/post';
import type { User } from '@/entities/user';

type MainCardProps = {
  post?: Post;
  user?: User;
  application?: Application;
  isOwner: boolean;
  mediaItems: {
    url: string;
    mimeType: string;
  }[];
  removePostFromCollection: (postId: string) => void;
};

export const MainCard = ({
  post,
  user,
  application,
  isOwner,
  mediaItems,
  removePostFromCollection,
}: MainCardProps) => {
  const [isOpenDeleteDialog, setIsOpenDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const navigate = useNavigate();

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
              sx={{ alignItems: 'center' }}
            >
              <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
                {post?.title}
              </Typography>

              {post?.urgent && (
                <Whatshot
                  color="error"
                  sx={{ fontSize: 44 }}
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

              {isOwner && (
                <IconButton onClick={handleClick}>
                  <MoreVert />
                </IconButton>
              )}

              <Menu
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    navigate(
                      `${ROUTES.MANAGE_APPLICATION}?id=${post?.id ?? ''}`
                    );
                    handleClose();
                  }}
                >
                  Редактировать
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setIsOpenDeleteDialog(true);
                    handleClose();
                  }}
                >
                  Удалить
                </MenuItem>
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
              spacing={1}
              sx={{ mt: 6, alignItems: 'center' }}
              direction="row"
            >
              <Typography sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                {getUserName(user)}
              </Typography>

              <IconButton
                onClick={() => navigate(`${ROUTES.PROFILE}?userId=${user?.id}`)}
              >
                <NorthEast />
              </IconButton>
            </Stack>

            <Rating
              readOnly
              value={4.5}
              precision={0.5}
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
