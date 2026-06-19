import { Share } from '@mui/icons-material';
import {
  IconButton,
  Menu,
  MenuItem,
  type IconButtonProps,
} from '@mui/material';
import { useMemo, useState, type MouseEvent } from 'react';

import { getPostShareUrl, openShareUrl, SHARE_TARGETS } from '@/shared';
import { useSnackbarStore } from '@/widgets';

type ShareButtonProps = {
  postId: string;
  title: string;
  size?: IconButtonProps['size'];
};

export const ShareButton = ({ postId, title, size }: ShareButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { setSnackbarOpen } = useSnackbarStore();

  const shareUrl = useMemo(() => getPostShareUrl(postId), [postId]);
  const open = Boolean(anchorEl);
  const canUseNativeShare = typeof navigator.share === 'function';

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setSnackbarOpen?.(true, 'Ссылка скопирована');
    handleClose();
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl });
    } catch {
      // User cancelled or share failed
    }
    handleClose();
  };

  const handleShareTarget = (
    getShareUrl: (url: string, title: string) => string
  ) => {
    openShareUrl(getShareUrl(shareUrl, title));
    handleClose();
  };

  return (
    <>
      <IconButton
        size={size}
        onClick={handleOpen}
      >
        <Share />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={e => e.stopPropagation()}
      >
        {canUseNativeShare && (
          <MenuItem onClick={() => void handleNativeShare()}>Ещё…</MenuItem>
        )}

        {SHARE_TARGETS.map(target => (
          <MenuItem
            key={target.id}
            onClick={() => handleShareTarget(target.getShareUrl)}
          >
            {target.label}
          </MenuItem>
        ))}

        <MenuItem onClick={() => void handleCopyLink()}>
          Скопировать ссылку
        </MenuItem>
      </Menu>
    </>
  );
};
