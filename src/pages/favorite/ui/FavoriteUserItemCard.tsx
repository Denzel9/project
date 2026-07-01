import { BusinessOutlined, Favorite, PersonOutlined } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { Link } from 'react-router';

import {
  getFavoriteUserName,
  useRemoveFavoriteUserMutation,
  type FavoriteUserItem,
} from '@/entities/favorite';
import { ROUTES } from '@/shared';

type FavoriteUserItemCardProps = {
  favorite: FavoriteUserItem;
};

export const FavoriteUserItemCard = ({
  favorite,
}: FavoriteUserItemCardProps) => {
  const { mutate: removeFavorite, isPending } = useRemoveFavoriteUserMutation();

  const { user } = favorite;
  const displayName = getFavoriteUserName(user);
  const isCompany = user.role === 'COMPANY';

  return (
    <Box
      component={Link}
      to={`${ROUTES.PROFILE}?userId=${favorite.userId}`}
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        color: 'inherit',
        bgcolor: 'white',
        borderRadius: '24px',
        textDecoration: 'none',
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        ':hover': {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Avatar
        src={user.avatar ?? undefined}
        sx={{ width: 72, height: 72, flexShrink: 0 }}
      />

      <Stack
        spacing={1}
        sx={{ flex: 1, minWidth: 0 }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75 }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600 }}
            noWrap
          >
            {displayName}
          </Typography>

          <Chip
            size="small"
            icon={isCompany ? <BusinessOutlined /> : <PersonOutlined />}
            label={isCompany ? 'Компания' : 'Креатор'}
            variant="outlined"
          />
        </Stack>

        {user.bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {user.bio}
          </Typography>
        )}

        <Stack
          direction="row"
          spacing={2}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="caption">
            Подписчиков: {user.followers}
          </Typography>
          <Typography variant="caption">
            Добавлено: {format(new Date(favorite.savedAt), 'dd.MM.yyyy')}
          </Typography>
        </Stack>
      </Stack>

      <IconButton
        color="primary"
        disabled={isPending}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
          removeFavorite(favorite.userId);
        }}
        sx={{ alignSelf: 'flex-start', flexShrink: 0 }}
      >
        <Favorite color="primary" />
      </IconButton>
    </Box>
  );
};
