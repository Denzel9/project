import { Upload } from '@mui/icons-material';
import { CircularProgress, IconButton } from '@mui/material';
import { useRef, type ChangeEvent } from 'react';

import {
  useProfileMediaUpload,
  type ProfileMediaField,
} from '../../model/hooks/useProfileMediaUpload';

type ProfileMediaUploadButtonProps = {
  field: ProfileMediaField;
  disabled?: boolean;
  onUploaded?: (url: string) => void;
  onError?: (message: string) => void;
};

export const ProfileMediaUploadButton = ({
  field,
  disabled = false,
  onUploaded,
  onError,
}: ProfileMediaUploadButtonProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const { upload, isPending } = useProfileMediaUpload({
    onSuccess: (_, url) => onUploaded?.(url),
    onError,
  });

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    void upload(field, file);
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        hidden
        onChange={handleChange}
      />

      <IconButton
        disabled={disabled || isPending}
        onClick={handleClick}
      >
        {isPending ? <CircularProgress size={24} /> : <Upload />}
      </IconButton>
    </>
  );
};
