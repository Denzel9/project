import { lazy, Suspense } from 'react';
import { Popover } from '@mui/material';

import type { EmojiClickData } from 'emoji-picker-react';

const EmojiPicker = lazy(() => import('emoji-picker-react'));

type ChatEmojiPickerProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
};

export const ChatEmojiPicker = ({
  anchorEl,
  open,
  onClose,
  onEmojiSelect,
}: ChatEmojiPickerProps) => {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  return (
    <Popover
      open={open}
      onClose={onClose}
      disableScrollLock
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: { overflow: 'hidden', borderRadius: '16px' },
        },
      }}
    >
      {open && (
        <Suspense fallback={null}>
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            searchPlaceHolder="Поиск эмодзи"
            previewConfig={{ showPreview: false }}
            width={320}
            height={400}
          />
        </Suspense>
      )}
    </Popover>
  );
};
