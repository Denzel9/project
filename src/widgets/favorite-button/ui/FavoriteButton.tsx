import { Favorite, FavoriteBorderOutlined } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from '@/entities/favorite';
import { useRequireEmailConfirmed } from '@/features/auth';
import { useApplicationItemStore } from '@/widgets/post-item/model/store';

const LONG_PRESS_MS = 500;
const MOVE_THRESHOLD_PX = 10;

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
  const { requireEmailConfirmed } = useRequireEmailConfirmed();
  const { setOpenAddToCollectionDialog } = useApplicationItemStore();

  const pressTimerRef = useRef<number | null>(null);
  const startPointRef = useRef<{ x: number; y: number } | null>(null);
  const didLongPressRef = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      setIsFavorite(isFavoriteProp);
    }, 0);
  }, [isFavoriteProp]);

  const clearPress = () => {
    if (pressTimerRef.current != null) {
      window.clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    startPointRef.current = null;
  };

  useEffect(() => () => clearPress(), []);

  const isFavoritePending = isAdding || isRemoving;

  const openCollectionDialog = () => {
    if (isFavoritePending) return;
    if (!requireEmailConfirmed()) return;

    setOpenAddToCollectionDialog(true, postId);
  };

  const handleToggleFavorite = () => {
    if (isFavoritePending) return;
    if (!requireEmailConfirmed()) return;

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

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || isFavoritePending) return;

    didLongPressRef.current = false;
    startPointRef.current = { x: event.clientX, y: event.clientY };
    pressTimerRef.current = window.setTimeout(() => {
      pressTimerRef.current = null;
      didLongPressRef.current = true;
      openCollectionDialog();
    }, LONG_PRESS_MS);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const start = startPointRef.current;

    if (!start || pressTimerRef.current == null) return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (dx * dx + dy * dy > MOVE_THRESHOLD_PX * MOVE_THRESHOLD_PX) {
      clearPress();
    }
  };

  const handlePointerEnd = () => {
    clearPress();
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }

    handleToggleFavorite();
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    clearPress();
    didLongPressRef.current = true;
    openCollectionDialog();
  };

  return (
    <IconButton
      disabled={isFavoritePending}
      aria-label={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onContextMenu={handleContextMenu}
      sx={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {isFavorite ? <Favorite color="primary" /> : <FavoriteBorderOutlined />}
    </IconButton>
  );
};
