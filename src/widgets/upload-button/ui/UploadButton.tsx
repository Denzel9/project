import styled from '@emotion/styled';

import type { Photo } from '@/entities/photo';
import type { ChangeEvent } from 'react';

interface UploadButtonProps {
  images?: Photo[];
  onChange?: (images: Photo[]) => void;
  files: File[];
  setFiles: (files: File[]) => void;
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
    if (filesName.includes(Array.from(event.target.files || [])[0].name)) {
      handleAddedIsSameFile();
      return;
    }

    const newFiles: Photo[] = Array.from(event.target.files || []).map(
      file => ({
        filename: file.text.name,
        key: URL.createObjectURL(file),
        lastModified: '',
        size: 1,
        url: URL.createObjectURL(file),
      })
    );

    if (newFiles.length > 0) {
      setFiles([...files, ...Array.from(event.target.files || [])]);
      onChange?.([...(images || []), ...newFiles]);
    }
  };

  return (
    <VisuallyHiddenInput
      max={6}
      multiple
      type="file"
      accept="image/*"
      onChange={handleFileChange}
    />
  );
};
