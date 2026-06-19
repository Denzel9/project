import { CloudUpload, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  // Chip,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';

import { theme } from '@/app/index';
import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities/task';
// import { validateChatMediaFile } from '@/entities/chat';
import { FullScreenGallery } from '@/widgets/media/ui/FullScreenGallery';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

import {
  getGallerySlideIndex,
  isGalleryMedia,
  toGalleryItems,
} from '../model/lib/commentMedia';

import type { Photo } from '@/entities/photo';

const ACCEPT = 'image/*,video/*';

type TaskResultDropzoneProps = {
  files: File[];
  images: Photo[];
  isSaving?: boolean;
  onSave: () => void;
  status: TaskStatus;
  canUpload?: boolean;
  onCancel: () => void;
  setFiles: (files: File[]) => void;
  setImages: (images: Photo[]) => void;
  onRemoveUploaded: (key: string) => void;
};

export const TaskResultDropzone = ({
  files,
  images,
  status,
  onSave,
  onCancel,
  setFiles,
  setImages,
  canUpload = true,
  isSaving = false,
  onRemoveUploaded,
}: TaskResultDropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  // const [error, setError] = useState<string | null>(null);
  const [isOpenAddMore, setIsOpenAddMore] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const galleryItems = useMemo(() => toGalleryItems(images), [images]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const addFiles = useCallback(
    (incoming: File[]) => {
      const validFiles: File[] = [];
      // let validationError: string | null = null;
      // const existingNames = new Set([
      //   ...files.map(file => file.name),
      //   ...images.map(image => image.filename).filter(Boolean),
      // ]);

      for (const file of incoming) {
        // if (existingNames.has(file.name)) {
        //   validationError = 'Этот файл уже добавлен';
        //   continue;
        // }

        // const fileError = validateChatMediaFile(file);

        // if (fileError) {
        //   validationError = fileError;
        //   continue;
        // }

        validFiles.push(file);
      }

      // if (!validFiles.length) {
      //   if (validationError) {
      //     setError(validationError);
      //   }

      //   return;
      // }

      const newPhotos: Photo[] = validFiles.map(file => ({
        lastModified: '',
        filename: file.name,
        mimeType: file.type,
        size: String(file.size),
        key: URL.createObjectURL(file),
        url: URL.createObjectURL(file),
      }));

      setFiles([...files, ...validFiles]);
      setImages([...images, ...newPhotos]);
      // setError(validationError);
    },
    [files, images, setFiles, setImages]
  );

  const handleRemovePending = useCallback(
    (key: string) => {
      const photo = images.find(image => image.key === key);

      if (photo?.url.startsWith('blob:')) {
        URL.revokeObjectURL(photo.url);
      }

      onRemoveUploaded(key);
    },
    [images, onRemoveUploaded]
  );

  const handleOpenGallery = useCallback(
    (index: number) => {
      const image = images[index];

      if (!image || !isGalleryMedia(image.mimeType) || !galleryItems.length) {
        return;
      }

      setGalleryInitialSlide(getGallerySlideIndex(images, index));
      setGalleryOpen(true);
    },
    [galleryItems.length, images]
  );

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounterRef.current -= 1;

    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragCounterRef.current = 0;
    setIsDragActive(false);

    if (!canUpload || isSaving) return;

    const droppedFiles = Array.from(event.dataTransfer.files);

    if (droppedFiles.length) {
      addFiles(droppedFiles);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length) {
      addFiles(selectedFiles);
    }

    event.target.value = '';
  };

  // const pendingFiles = files.map(file => file.name);

  return (
    <Box sx={{ bgcolor: 'white', p: 4, borderRadius: '32px' }}>
      <Stack spacing={4}>
        <Stack
          direction="row"
          sx={{ width: '100%', justifyContent: 'space-between' }}
        >
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: '24px',
              color: 'info.main',
            }}
          >
            Результат работы
          </Typography>

          {!isOpenAddMore &&
            canUpload &&
            status !== TASK_STATUS_ENUM.CHECKING && (
              <Button
                size="small"
                onClick={() => setIsOpenAddMore(true)}
                sx={{ px: 2 }}
              >
                Редактировать
              </Button>
            )}
        </Stack>

        {Boolean(images.length) && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {images.map((image, index) => {
              const canOpenGallery = isGalleryMedia(image.mimeType);

              return (
                <Box
                  key={image.key}
                  sx={{
                    width: 100,
                    position: 'relative',
                  }}
                >
                  {canUpload && isOpenAddMore && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={event => {
                        event.stopPropagation();
                        handleRemovePending(image.key);
                      }}
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: -12,
                        zIndex: 2,
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}

                  <Box
                    onClick={() => handleOpenGallery(index)}
                    sx={{
                      width: '100%',
                      height: 125,
                      cursor: canOpenGallery ? 'pointer' : 'default',
                    }}
                  >
                    <MediaItem
                      src={image.url}
                      alt={image.key}
                      mimeType={image.mimeType}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {((Boolean(files.length) && canUpload) || isOpenAddMore) && (
          <Box
            role="button"
            tabIndex={0}
            onClick={() => !isSaving && fileInputRef.current?.click()}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                if (!isSaving) {
                  fileInputRef.current?.click();
                }
              }
            }}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
              py: 4,
              px: 2,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              borderRadius: '8px',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive ? 'action.hover' : 'transparent',
              opacity: isSaving ? 0.6 : 1,
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            <CloudUpload
              sx={{
                fontSize: 40,
                color: isDragActive ? 'primary.main' : 'text.disabled',
                mb: 1,
              }}
            />

            <Typography
              variant="body1"
              color="textPrimary"
            >
              Перетащите файлы сюда
            </Typography>

            <Typography
              variant="body2"
              color="textSecondary"
            >
              или нажмите для выбора
            </Typography>

            <input
              hidden
              multiple
              type="file"
              ref={fileInputRef}
              accept={ACCEPT}
              disabled={isSaving}
              onChange={handleFileChange}
            />
          </Box>
        )}

        {/* {error && (
          <Typography
            variant="body2"
            color="error"
          >
            {error}
          </Typography>
        )} */}

        {((canUpload && Boolean(files.length)) || isOpenAddMore) && (
          <Stack
            spacing={2}
            direction="row"
          >
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={() => {
                onCancel();
                setIsOpenAddMore(false);
              }}
              disabled={isSaving}
            >
              Отменить
            </Button>

            <Button
              size="small"
              variant="outlined"
              loading={isSaving}
              disabled={Boolean(!files.length)}
              onClick={() => {
                onSave();
                setIsOpenAddMore(false);
              }}
            >
              Сохранить
            </Button>
          </Stack>
        )}
      </Stack>

      <FullScreenGallery
        isOpen={galleryOpen}
        isMobile={isMobile}
        items={galleryItems}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  );
};
