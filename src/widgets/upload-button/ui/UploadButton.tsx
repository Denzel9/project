import styled from '@emotion/styled';

import type { Photo } from '@/entities/photo';
import { filterValidMediaFiles, MEDIA_POST_ACCEPT } from '@/shared/lib/media';

import type { ChangeEvent } from 'react';

interface UploadButtonProps {
  files: File[];
  images?: Photo[];
  setFiles: (files: File[]) => void;
  onChange?: (images: Photo[]) => void;
  onValidationError?: (message: string) => void;
}

const VisuallyHiddenInput = styled('input')({
  left: 0,
  width: 1,
  height: 1,
  bottom: 0,
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
});

export const UploadButton = ({
  onChange,
  images,
  files,
  setFiles,
  onValidationError,
}: UploadButtonProps) => {
  const filesName = files?.map(file => file.name);

  const handleAddedIsSameFile = () => {
    // dispatch(
    //   openSnackbar({
    //     isOpen: true,
    //     state: 'error',
    //     message: 'Это фото уже было добавлено ранее',
    //   })
    // );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (!selectedFiles.length) return;

    const firstFile = selectedFiles[0];

    if (filesName.includes(firstFile.name)) {
      handleAddedIsSameFile();
      return;
    }

    const { valid, errors } = filterValidMediaFiles(selectedFiles);

    if (errors.length) {
      onValidationError?.(errors[0]);
    }

    if (!valid.length) return;

    const newFiles: Photo[] = valid.map(file => {
      const previewUrl = URL.createObjectURL(file);

      return {
        lastModified: '',
        filename: file.name,
        mimeType: file.type,
        size: String(file.size),
        key: previewUrl,
        url: previewUrl,
      };
    });

    setFiles([...files, ...valid]);
    onChange?.([...(images || []), ...newFiles]);
  };

  return (
    <VisuallyHiddenInput
      max={6}
      multiple
      type="file"
      accept={MEDIA_POST_ACCEPT}
      onChange={handleFileChange}
    />
  );
};
