import { Favorite, FavoriteBorderOutlined } from '@mui/icons-material';
import { Box, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

import {
  useAddFavoriteMutation,
  useRemoveFavoriteUserMutation,
} from '@/entities/favorite';
import { useRequireEmailConfirmed } from '@/features/auth';

type UserFavoriteButtonProps = {
  userId: string;
  isFavorite?: boolean;
};

export const UserFavoriteButton = ({
  userId,
  isFavorite: isFavoriteProp = false,
}: UserFavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);

  const { mutate: addFavorite, isPending: isAdding } = useAddFavoriteMutation();
  const { mutate: removeFavorite, isPending: isRemoving } =
    useRemoveFavoriteUserMutation();
  const { requireEmailConfirmed } = useRequireEmailConfirmed();

  useEffect(() => {
    setTimeout(() => {
      setIsFavorite(isFavoriteProp);
    }, 0);
  }, [isFavoriteProp]);

  const isFavoritePending = isAdding || isRemoving;

  const handleToggleFavorite = () => {
    if (!userId || isFavoritePending) return;
    if (!requireEmailConfirmed()) return;

    if (isFavorite) {
      removeFavorite(userId, {
        onSuccess: () => setIsFavorite(false),
      });
    } else {
      addFavorite(
        { userId },
        {
          onSuccess: () => setIsFavorite(true),
        }
      );
    }
  };

  return (
    <Box>
      <IconButton
        disabled={isFavoritePending}
        onClick={handleToggleFavorite}
      >
        {isFavorite ? <Favorite color="primary" /> : <FavoriteBorderOutlined />}
      </IconButton>
    </Box>
  );
};
