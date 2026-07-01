import { Favorite, FavoriteBorderOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

import {
  useAddFavoriteMutation,
  useRemoveFavoriteUserMutation,
} from '@/entities/favorite';

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

  useEffect(() => {
    setTimeout(() => {
      setIsFavorite(isFavoriteProp);
    }, 0);
  }, [isFavoriteProp]);

  const isFavoritePending = isAdding || isRemoving;

  const handleToggleFavorite = () => {
    if (!userId || isFavoritePending) return;

    if (isFavorite) {
      removeFavorite(userId, {
        onSuccess: () => setIsFavorite(false),
      });
    } else {
      addFavorite(
        { userId },
        {
          onSuccess: () => setIsFavorite(true),
        },
      );
    }
  };

  return (
    <IconButton
      disabled={isFavoritePending}
      onClick={handleToggleFavorite}
    >
      {isFavorite ? <Favorite color="primary" /> : <FavoriteBorderOutlined />}
    </IconButton>
  );
};
