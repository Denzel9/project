import { Delete } from '@mui/icons-material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, IconButton, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { MediaItem, UploadButton } from '@/widgets';

import type { Photo } from '@/entities/photo';

type DraggableImageProps = {
  image: Photo;
  index: number;
  images: Photo[];
  setImages: (images: Photo[]) => void;
  setDeletedFiles: (key: string) => void;
  moveImage: (fromIndex: number, toIndex: number) => void;
  canDeleteImage: (image: Photo) => boolean;
};

type GalleryProps = {
  files: File[];
  images: Photo[];
  mainImage?: string;
  setFiles: (files: File[]) => void;
  setImages: (images: Photo[]) => void;
  setDeletedFiles: (key: string) => void;
  canDeleteImage?: (image: Photo) => boolean;
  canUpload?: boolean;
};

const DraggableImage = ({
  image,
  index,
  moveImage,
  images,
  setImages,
  setDeletedFiles,
  canDeleteImage,
}: DraggableImageProps) => {
  const [isShowDeleteBtn, setIsShowDeleteBtn] = useState(true);

  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'IMAGE',
    item: { index },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'IMAGE',
    drop: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const handleDelete = () => {
    const findedImage = images.filter(
      imagesItem => imagesItem.url !== image.url
    );
    setDeletedFiles(image.key);
    setImages(findedImage);
  };

  // eslint-disable-next-line react-hooks/refs
  drag(drop(ref));

  return (
    <Box
      ref={ref}
      sx={{
        width: 100,
        cursor: 'grab',
        borderRadius: 4,
        position: 'relative',
        bgcolor: 'transparent',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {isShowDeleteBtn && canDeleteImage(image) && (
        <IconButton
          color="error"
          onClick={handleDelete}
          sx={{ position: 'absolute', top: -16, right: -16, zIndex: 2 }}
        >
          <Delete />
        </IconButton>
      )}

      <Box
        sx={{
          width: '100%',
          height: '100%',
        }}
        onPointerDown={() => setIsShowDeleteBtn(isDragging)}
        onPointerUp={() => setIsShowDeleteBtn(!isDragging)}
        onDragEnd={() => setIsShowDeleteBtn(!isDragging)}
      >
        <MediaItem
          src={image.url}
          mimeType={image.mimeType}
          alt={image.key}
        />
      </Box>
    </Box>
  );
};

const Gallery = ({
  files,
  setFiles,
  setDeletedFiles,
  images,
  setImages,
  canDeleteImage = () => true,
  canUpload = true,
}: GalleryProps) => {
  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DndProvider backend={HTML5Backend}>
        <Typography
          color="textDisabled"
          variant="caption"
        >
          Основное фото
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, my: 1 }}>
          {images?.map((image, index) => (
            <DraggableImage
              key={image.key}
              image={image}
              index={index}
              images={images}
              setImages={setImages}
              moveImage={moveImage}
              setDeletedFiles={setDeletedFiles}
              canDeleteImage={canDeleteImage}
            />
          ))}

          {canUpload && images.length < 10 && (
            <Button
              component="label"
              size="small"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              sx={{
                width: '100px',
                height: '125px',
                display: 'flex',
                textAlign: 'center',
                alignItems: 'center',
                position: 'relative',
                textTransform: 'none',
                flexDirection: 'column',
                '& .MuiButton-startIcon': { m: 0 },
              }}
            >
              <Box>
                <Typography>Добавить фото</Typography>
                <UploadButton
                  images={images}
                  onChange={setImages}
                  files={files}
                  setFiles={setFiles}
                />
              </Box>
            </Button>
          )}
        </Box>

        <Typography
          color="textDisabled"
          variant="caption"
        >
          {images.length} из 6
        </Typography>
      </DndProvider>
    </Box>
  );
};

export default Gallery;
