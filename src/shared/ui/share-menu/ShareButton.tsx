import { Share } from '@mui/icons-material';
import {
  IconButton,
  Menu,
  MenuItem,
  type IconButtonProps,
} from '@mui/material';
import { useMemo, useState, type MouseEvent } from 'react';

import {
  useConversationsQuery,
  useCreateConversationMutation,
} from '@/entities/chat';
import { sendPostLinkToChat } from '@/features';
import { getPostShareUrl, openShareUrl, SHARE_TARGETS } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { SharePostToChatDialog } from './SharePostToChatDialog';

type ShareButtonProps = {
  postId: string;
  title: string;
  size?: IconButtonProps['size'];
};

export const ShareButton = ({ postId, title, size }: ShareButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isShareToChatOpen, setIsShareToChatOpen] = useState(false);
  const [isSendingToChat, setIsSendingToChat] = useState(false);
  const [shareToChatError, setShareToChatError] = useState<string | null>(null);

  const { setSnackbarOpen } = useSnackbarStore();

  const shareUrl = useMemo(() => getPostShareUrl(postId), [postId]);
  const open = Boolean(anchorEl);
  const canUseNativeShare = typeof navigator.share === 'function';

  const { data: conversations = [], isLoading: isConversationsLoading } =
    useConversationsQuery(undefined, { enabled: isShareToChatOpen });
  const { mutateAsync: createConversation } = useCreateConversationMutation();

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenShareToChat = () => {
    setShareToChatError(null);
    setIsShareToChatOpen(true);
    handleClose();
  };

  const handleSendPostToChat = async (peerId: string) => {
    if (!postId || isSendingToChat) {
      return false;
    }

    try {
      setIsSendingToChat(true);
      setShareToChatError(null);

      await sendPostLinkToChat({
        postId,
        postTitle: title,
        peerId,
        conversations,
        createConversation,
      });

      setSnackbarOpen?.(true, 'Ссылка на пост отправлена в чат');
      return true;
    } catch {
      setShareToChatError('Не удалось отправить ссылку в чат');
      return false;
    } finally {
      setIsSendingToChat(false);
    }
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
        disabled={!postId}
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

        <MenuItem
          key="send-to-chat"
          onClick={handleOpenShareToChat}
        >
          Отправить в чат
        </MenuItem>

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

      <SharePostToChatDialog
        open={isShareToChatOpen}
        onClose={() => setIsShareToChatOpen(false)}
        conversations={conversations}
        isLoading={isConversationsLoading}
        isSending={isSendingToChat}
        error={shareToChatError}
        postTitle={title}
        postUrl={shareUrl}
        onSend={handleSendPostToChat}
      />
    </>
  );
};
