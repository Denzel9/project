import { Favorite, FavoriteBorderOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useEffect, useState } from 'react';

import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from '@/entities/favorite';

type FavoriteButtonProps = {
  postId: string;
  isFavorite?: boolean;
};

export const FavoriteButton = ({
  postId,
  isFavorite: isFavoriteProp = false,
}: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp);

  const { mutate: addFavorite, isPending: isAdding } = useAddFavoriteMutation();
  const { mutate: removeFavorite, isPending: isRemoving } =
    useRemoveFavoriteMutation();

  useEffect(() => {
    setTimeout(() => {
      setIsFavorite(isFavoriteProp);
    }, 0);
  }, [isFavoriteProp]);

  const isFavoritePending = isAdding || isRemoving;

  const handleToggleFavorite = () => {
    if (isFavoritePending) return;

    if (isFavorite) {
      removeFavorite(postId, {
        onSuccess: () => setIsFavorite(false),
      });
    } else {
      addFavorite(
        { postId },
        {
          onSuccess: () => setIsFavorite(true),
        }
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
