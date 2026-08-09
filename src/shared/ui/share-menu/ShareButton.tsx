import { Share } from '@mui/icons-material';
import {
  Divider,
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
import { sendPostLinkToChat, sendProfileLinkToChat } from '@/features';
import { getPostShareUrl, getProfileShareUrl, openShareUrl, SHARE_TARGETS } from '@/shared';
import { useSnackbarStore } from '@/widgets';

import { SharePostToChatDialog } from './SharePostToChatDialog';

type ShareButtonProps = {
  title: string;
  size?: IconButtonProps['size'];
  postId?: string;
  userId?: string;
};

export const ShareButton = ({
  postId,
  userId,
  title,
  size,
}: ShareButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isShareToChatOpen, setIsShareToChatOpen] = useState(false);
  const [isSendingToChat, setIsSendingToChat] = useState(false);
  const [shareToChatError, setShareToChatError] = useState<string | null>(null);

  const { setSnackbarOpen } = useSnackbarStore();

  const shareUrl = useMemo(() => {
    if (postId) {
      return getPostShareUrl(postId);
    }

    if (userId) {
      return getProfileShareUrl(userId);
    }

    return '';
  }, [postId, userId]);
  const open = Boolean(anchorEl);
  const canUseNativeShare = typeof navigator.share === 'function';
  const isDisabled = !postId && !userId;

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

  const handleSendToChat = async (peerId: string) => {
    if (isSendingToChat || (!postId && !userId)) {
      return false;
    }

    try {
      setIsSendingToChat(true);
      setShareToChatError(null);

      if (postId) {
        await sendPostLinkToChat({
          postId,
          postTitle: title,
          peerId,
          conversations,
          createConversation,
        });
        setSnackbarOpen?.(true, 'Ссылка на пост отправлена в чат');
      } else if (userId) {
        await sendProfileLinkToChat({
          userId,
          profileTitle: title,
          peerId,
          conversations,
          createConversation,
        });
        setSnackbarOpen?.(true, 'Ссылка на профиль отправлена в чат');
      }

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
        disabled={isDisabled}
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

        <Divider />

        {SHARE_TARGETS.map(target => (
          <MenuItem
            key={target.id}
            onClick={() => handleShareTarget(target.getShareUrl)}
          >
            {target.label}
          </MenuItem>
        ))}

        <Divider />

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
        onSend={handleSendToChat}
      />
    </>
  );
};
