import {
  AddPhotoAlternateOutlined,
  AssignmentTurnedInOutlined,
  Close,
  CloudUploadOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  RefreshOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
} from '@mui/material';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type DragEvent,
  type SetStateAction,
} from 'react';
import { Link } from 'react-router';

import { theme } from '@/app/index';
import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities/task';
import { ROUTES } from '@/shared';
import {
  createLocalMediaPlaceholders,
  hasPreparingMedia,
  hasVideoMedia,
  prepareLocalMediaFiles,
  revokeLocalPhotoUrl,
  type LocalMediaFile,
} from '@/shared/lib/media';
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
  deadline: string | null;
  files: LocalMediaFile[];
  images: Photo[];
  postId?: string | null;
  postTitle?: string | null;
  isSaving?: boolean;
  onSave: () => void;
  status: TaskStatus;
  canUpload?: boolean;
  onCancel: () => void;
  setFiles: Dispatch<SetStateAction<LocalMediaFile[]>>;
  setImages: Dispatch<SetStateAction<Photo[]>>;
  onRemoveUploaded: (key: string) => void;
  onRetryLocal?: (localId: string) => void;
};

const formatFileSize = (size?: string) => {
  const bytes = Number(size);

  if (!bytes || Number.isNaN(bytes)) return null;

  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const formatFileCount = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} файл`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} файла`;
  }

  return `${count} файлов`;
};

const getStatusHint = (
  status: TaskStatus,
  canUpload: boolean,
  hasMedia: boolean
) => {
  if (status === TASK_STATUS_ENUM.IN_PROGRESS && canUpload) {
    return hasMedia
      ? 'Загрузите все материалы и нажмите «Сохранить», когда будете готовы отправить на проверку.'
      : 'Перетащите фото или видео сюда — заказчик увидит результат после сохранения.';
  }

  if (status === TASK_STATUS_ENUM.CHECKING) {
    return 'Материалы отправлены на проверку. Редактирование недоступно.';
  }

  if (status === TASK_STATUS_ENUM.COMPLETED && hasMedia) {
    return 'Итоговые материалы по задаче.';
  }

  if (!hasMedia) {
    return 'Исполнитель ещё не загрузил результат.';
  }

  return null;
};

export const TaskResultDropzone = ({
  deadline,
  files,
  images,
  postId,
  postTitle,
  status,
  onSave,
  onCancel,
  setFiles,
  setImages,
  canUpload = true,
  isSaving = false,
  onRemoveUploaded,
  onRetryLocal,
}: TaskResultDropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const galleryItems = useMemo(() => toGalleryItems(images), [images]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const canEdit = canUpload && status === TASK_STATUS_ENUM.IN_PROGRESS;
  const hasMedia = images.length > 0;
  const hasPendingFiles = files.length > 0;
  const isPreparing = hasPreparingMedia(images);
  const showDropzone = canEdit && (isAdding || !hasMedia || hasPendingFiles);
  const showEditControls = canEdit && hasMedia && !hasPendingFiles;
  const statusHint = getStatusHint(status, canUpload, hasMedia);
  const showVideoHint = hasVideoMedia(files);

  const mediaCount = images.length;

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;

      const { placeholders, localFiles } = createLocalMediaPlaceholders(
        incoming,
        files,
      );

      if (!localFiles.length) return;

      setFiles(prev => [...prev, ...localFiles]);
      setImages(prev => [...prev, ...placeholders]);
      setIsAdding(true);

      void prepareLocalMediaFiles(
        localFiles,
        (prepared, previewUrl) => {
          setFiles(prev =>
            prev.map(item =>
              item.localId === prepared.localId ? prepared : item,
            ),
          );
          setImages(prev =>
            prev.map(image => {
              if (image.localId !== prepared.localId) return image;
              revokeLocalPhotoUrl(image);
              return {
                ...image,
                url: previewUrl,
                key: prepared.localId,
                mimeType: prepared.file.type,
                size: String(prepared.file.size),
                filename: prepared.file.name,
                uploadStatus: 'ready',
                uploadProgress: 0,
                uploadError: undefined,
              };
            }),
          );
        },
        (localId, error) => {
          setImages(prev =>
            prev.map(image =>
              image.localId === localId
                ? {
                  ...image,
                  uploadStatus: 'error',
                  uploadError: error.message,
                }
                : image,
            ),
          );
        },
      );
    },
    [files, setFiles, setImages],
  );

  const handleRemovePending = useCallback(
    (key: string) => {
      const photo = images.find(
        image => image.key === key || image.localId === key,
      );

      if (photo) {
        revokeLocalPhotoUrl(photo);
      }

      onRemoveUploaded(photo?.localId ?? key);
    },
    [images, onRemoveUploaded],
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

    if (!canEdit || isSaving) return;

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

  const handleCancel = () => {
    onCancel();
    setIsAdding(false);
  };

  const handleSave = () => {
    onSave();
    setIsAdding(false);
  };

  return (
    <Box
      sx={{
        bgcolor: 'white',
        p: 2,
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: isMobile ? 'flex-start' : 'center', flex: 1, minWidth: 0 }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                display: 'flex',
                flexShrink: 0,
                borderRadius: '14px',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'secondary.light',
                color: 'primary.main',
              }}
            >
              <AssignmentTurnedInOutlined />
            </Box>

            <Stack
              direction="row"
              sx={{
                width: '100%',
                alignItems: 'start',
                justifyContent: 'space-between',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'start' }}
              >
                <Box sx={{ width: '100%' }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-start' }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: 'info.main' }}
                    >
                      Результаты работы
                    </Typography>
                    {hasMedia && (
                      <Chip
                        size="small"
                        label={formatFileCount(mediaCount)}
                        sx={{ bgcolor: 'secondary.light', fontWeight: 500 }}
                      />
                    )}

                    {status !== TASK_STATUS_ENUM.CHECKING && deadline && (
                      <Chip
                        size="small"
                        color="warning"
                        label={`${isMobile ? '' : 'Прекрепить до'}${new Date(deadline ?? '').toLocaleDateString()}`}
                      />
                    )}

                    {status === TASK_STATUS_ENUM.CHECKING && (
                      <Chip
                        size="small"
                        color="warning"
                        label="На проверке"
                      />
                    )}
                  </Stack>

                  {statusHint && (
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      sx={{ color: 'text.secondary' }}
                    >
                      {statusHint}
                    </Typography>
                  )}
                </Box>
              </Stack>

              {status === TASK_STATUS_ENUM.COMPLETED && postId && (
                <Button
                  size="small"
                  component={Link}
                  to={`${ROUTES.PUBLICATIONS}?postId=${encodeURIComponent(postId)}`}
                  state={
                    postTitle?.trim()
                      ? { postTitle: postTitle.trim() }
                      : undefined
                  }
                  sx={{ px: 2 }}
                >
                  Перейти к публикации
                </Button>
              )}
            </Stack>
          </Stack>

          {showEditControls && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddPhotoAlternateOutlined />}
              onClick={() => setIsAdding(true)}
              sx={{ flexShrink: 0, borderRadius: '12px' }}
            >
              Добавить файлы
            </Button>
          )}
        </Stack>

        {hasMedia && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(3, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 1.5,
            }}
          >
            {images.map((image, index) => {
              const isVideo = image.mimeType.startsWith('video/');
              const canOpenGallery = isGalleryMedia(image.mimeType);
              const isPending = Boolean(image.localId) || image.url.startsWith('blob:');
              const canRemove =
                canEdit &&
                (isAdding || isPending) &&
                !isSaving &&
                image.uploadStatus !== 'uploading';

              return (
                <Box
                  key={image.localId ?? image.key}
                  sx={{
                    position: 'relative',
                    aspectRatio: '4 / 5',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    bgcolor: 'secondary.light',
                    border: '1px solid',
                    borderColor: isPending ? 'primary.main' : 'divider',
                    boxShadow: isPending
                      ? `0 0 0 1px ${alpha(theme.palette.primary.main, 0.2)}`
                      : 'none',
                  }}
                >
                  <Box
                    onClick={() => handleOpenGallery(index)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      cursor: canOpenGallery ? 'pointer' : 'default',
                    }}
                  >
                    <MediaItem
                      src={image.url}
                      alt={image.filename || image.key}
                      mimeType={image.mimeType}
                    />
                  </Box>

                  {image.uploadStatus === 'preparing' ||
                    image.uploadStatus === 'uploading' ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.75,
                        bgcolor: alpha('#000', 0.5),
                        color: 'common.white',
                      }}
                    >
                      <CircularProgress
                        size={28}
                        variant={
                          image.uploadStatus === 'uploading' &&
                            image.uploadProgress
                            ? 'determinate'
                            : 'indeterminate'
                        }
                        value={image.uploadProgress ?? 0}
                        sx={{ color: 'common.white' }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {image.uploadStatus === 'preparing'
                          ? 'Сжатие…'
                          : `${image.uploadProgress ?? 0}%`}
                      </Typography>
                    </Box>
                  ) : null}

                  {image.uploadStatus === 'error' ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        px: 1,
                        bgcolor: alpha('#000', 0.55),
                        color: 'common.white',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ textAlign: 'center', lineHeight: 1.2 }}
                      >
                        {image.uploadError || 'Ошибка'}
                      </Typography>
                      {image.localId && onRetryLocal ? (
                        <IconButton
                          size="small"
                          onClick={event => {
                            event.stopPropagation();
                            onRetryLocal(image.localId!);
                          }}
                          sx={{ color: 'common.white' }}
                        >
                          <RefreshOutlined fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Box>
                  ) : null}

                  {isPending && image.uploadStatus === 'ready' && (
                    <Chip
                      size="small"
                      label="Новый"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 8,
                        height: 22,
                        fontSize: 11,
                      }}
                    />
                  )}

                  {isVideo && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 8,
                        top: isPending ? 36 : 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: '999px',
                        bgcolor: alpha('#000', 0.55),
                        color: 'white',
                      }}
                    >
                      <PlayCircleOutlined sx={{ fontSize: 16 }} />
                      <Typography variant="caption">Видео</Typography>
                    </Box>
                  )}

                  {canRemove && (
                    <IconButton
                      size="small"
                      aria-label="Удалить файл"
                      onClick={event => {
                        event.stopPropagation();
                        handleRemovePending(image.localId ?? image.key);
                      }}
                      sx={{
                        position: 'absolute',
                        top: 6,
                        right: 6,
                        zIndex: 2,
                        bgcolor: alpha('#fff', 0.92),
                        boxShadow: 1,
                        '&:hover': {
                          bgcolor: 'error.light',
                          color: 'error.main',
                        },
                      }}
                    >
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  )}

                  {image.filename && !isVideo && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        px: 1,
                        py: 0.75,
                        background: `linear-gradient(transparent, ${alpha('#000', 0.65)})`,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          color: 'white',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {image.filename}
                      </Typography>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {!hasMedia && !canEdit && (
          <Box
            sx={{
              py: 4,
              px: 2,
              textAlign: 'center',
              borderRadius: '16px',
              bgcolor: 'secondary.light',
            }}
          >
            <CloudUploadOutlined
              sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {statusHint ?? 'Пока нет загруженных материалов'}
            </Typography>
          </Box>
        )}

        {showDropzone && (
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
              py: hasMedia ? 2.5 : 4,
              px: 2,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              borderRadius: '16px',
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive
                ? alpha(theme.palette.primary.main, 0.06)
                : 'secondary.light',
              opacity: isSaving ? 0.6 : 1,
              transition: 'border-color 0.2s ease, background-color 0.2s ease',
            }}
          >
            <CloudUploadOutlined
              sx={{
                fontSize: hasMedia ? 32 : 40,
                color: isDragActive ? 'primary.main' : 'text.disabled',
                mb: 1,
              }}
            />

            <Typography
              variant="body1"
              color="info"
              sx={{ fontWeight: 500 }}
            >
              {hasMedia ? 'Добавить ещё файлы' : 'Перетащите файлы сюда'}
            </Typography>

            <Typography
              variant="body2"
              color="info"
              sx={{ mt: 0.5 }}
            >
              Фото и видео · или нажмите для выбора
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

        {isAdding && hasMedia && !hasPendingFiles && (
          <Stack
            direction="row"
            sx={{ justifyContent: 'flex-end' }}
          >
            <Button
              size="small"
              variant="text"
              startIcon={<Close />}
              onClick={() => setIsAdding(false)}
            >
              Скрыть загрузку
            </Button>
          </Stack>
        )}

        {hasPendingFiles && (
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.15),
            }}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 600 }}
                >
                  {formatFileCount(files.length)} к сохранению
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {showVideoHint
                    ? 'Видео загружается без сжатия. '
                    : ''}
                  {files
                    .slice(0, 2)
                    .map(item => {
                      const size = formatFileSize(String(item.file.size));

                      return size
                        ? `${item.file.name} · ${size}`
                        : item.file.name;
                    })
                    .join(', ')}
                  {files.length > 2 ? ` и ещё ${files.length - 2}` : ''}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                sx={{ flexShrink: 0 }}
              >
                <Button
                  size="small"
                  color="inherit"
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isSaving}
                  sx={{ borderRadius: '12px' }}
                >
                  Отменить
                </Button>

                <Button
                  size="small"
                  variant="contained"
                  loading={isSaving}
                  disabled={isPreparing}
                  startIcon={<SaveOutlined />}
                  onClick={handleSave}
                  sx={{ borderRadius: '12px' }}
                >
                  Сохранить
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Stack>

      <FullScreenGallery
        isOpen={galleryOpen}
        isMobile={isMobile}
        variant="phone"
        items={galleryItems}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box>
  );
};
