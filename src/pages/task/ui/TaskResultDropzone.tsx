import {
  Add,
  AssignmentTurnedInOutlined,
  Close,
  CloudUploadOutlined,
  DeleteOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  PlayCircleOutlined,
  RefreshOutlined,
  SaveOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
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

import { TASK_STATUS_ENUM, type TaskStatus } from '@/entities/task';
import { getPublicationsHref } from '@/pages/publications/model/utils';
import {
  createLocalMediaPlaceholders,
  hasPreparingMedia,
  hasVideoMedia,
  MAX_TASK_REPORT_FILES,
  MEDIA_FILE_TEMPLATE_ACCEPT,
  prepareLocalMediaFiles,
  revokeLocalPhotoUrl,
  TASK_REPORT_ARCHIVE_HINT,
  type LocalMediaFile,
} from '@/shared/lib/media';
import { useSnackbarStore } from '@/widgets';
import { FullScreenGallery } from '@/widgets/media/ui/FullScreenGallery';
import { MediaItem } from '@/widgets/media/ui/MediaItem';

import {
  getGallerySlideIndex,
  isGalleryMedia,
  toGalleryItems,
} from '../model/lib/commentMedia';

import type { Photo } from '@/entities/photo';
import type { PostDeliverable } from '@/entities/post';

const ACCEPT = MEDIA_FILE_TEMPLATE_ACCEPT;

type TaskResultDropzoneProps = {
  deadline: string | null;
  files: LocalMediaFile[];
  images: Photo[];
  postId?: string | null;
  postTitle?: string | null;
  deliverables?: PostDeliverable[] | null;
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

const getDeliverablePlatformCount = (
  deliverables?: PostDeliverable[] | null,
) =>
  new Set(
    (deliverables ?? [])
      .map(item => item.platform)
      .filter(Boolean),
  ).size;

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

const formatPublicationLinkLabel = (count: number) => {
  if (count <= 1) return 'Перейти к публикации';

  return 'Перейти к публикациям';
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
  deliverables,
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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialSlide, setGalleryInitialSlide] = useState(0);
  const { setSnackbarOpen } = useSnackbarStore();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const galleryItems = useMemo(() => toGalleryItems(images), [images]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const canEdit = canUpload && status === TASK_STATUS_ENUM.IN_PROGRESS;
  const hasMedia = images.length > 0;
  const hasPendingFiles = files.length > 0;
  const isPreparing = hasPreparingMedia(images);
  const mediaCount = images.length;
  const remainingSlots = Math.max(0, MAX_TASK_REPORT_FILES - mediaCount);
  const isAtFileLimit = remainingSlots === 0;
  const showDropzone =
    canEdit &&
    !isAtFileLimit &&
    (isAdding || !hasMedia || hasPendingFiles);
  const showEditControls = canEdit && hasMedia && !hasPendingFiles;
  const statusHint = getStatusHint(status, canUpload, hasMedia);
  const showVideoHint = hasVideoMedia(files);

  const addFiles = useCallback(
    (incoming: File[]) => {
      if (!incoming.length) return;

      if (remainingSlots <= 0) {
        setSnackbarOpen(true, TASK_REPORT_ARCHIVE_HINT);
        return;
      }

      if (incoming.length > remainingSlots) {
        setSnackbarOpen(true, TASK_REPORT_ARCHIVE_HINT);
      }

      const { placeholders, localFiles } = createLocalMediaPlaceholders(
        incoming.slice(0, remainingSlots),
        files,
        {
          onValidationError: message => setSnackbarOpen(true, message),
        },
      );

      if (!localFiles.length) return;

      setFiles(prev => [...prev, ...localFiles]);
      setImages(prev => [...prev, ...placeholders]);
      setIsAdding(true);
      setIsCollapsed(false);

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
    [files, remainingSlots, setFiles, setImages, setSnackbarOpen],
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

  const mediaCountLabel = useMemo(() => {
    return isMobile ? `${mediaCount}/${MAX_TASK_REPORT_FILES}` : `${formatFileCount(mediaCount)} из ${MAX_TASK_REPORT_FILES}`;
  }, [mediaCount, isMobile]);
  const publicationLinkLabel = formatPublicationLinkLabel(
    getDeliverablePlatformCount(deliverables),
  );

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: '32px',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'flex-start', md: isCollapsed ? 'center' : 'start' } }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: isMobile ? 'center' : isCollapsed ? 'center' : 'start', flex: 1, minWidth: 0, width: '100%' }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                display: { xs: 'none', md: 'flex' },
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
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Stack
                spacing={1}
                direction="row"
                sx={{ alignItems: 'start', justifyContent: 'space-between', width: '100%' }}
              >
                <Box sx={{ width: '100%' }}>
                  <Stack
                    spacing={1}
                    direction="row"
                    sx={{
                      alignItems: { xs: 'start', md: 'center' },
                      justifyContent: isMobile ? 'space-between' : 'flex-start'
                    }}
                  >
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: 'info.main' }}
                      >
                        Результаты работы
                      </Typography>

                      {hasMedia && (
                        <Chip
                          size="small"
                          label={mediaCountLabel}
                          sx={{ bgcolor: 'secondary.light', fontWeight: 500 }}
                        />
                      )}
                    </Stack>

                    {status !== TASK_STATUS_ENUM.CHECKING && deadline && !hasMedia && (
                      <Chip
                        size="small"
                        color="warning"
                        label={`${isMobile ? '' : 'Прекрепить до'} ${new Date(deadline ?? '').toLocaleDateString()}`}
                      />
                    )}

                    {status === TASK_STATUS_ENUM.CHECKING && (
                      <Chip
                        size="small"
                        color="warning"
                        label="На проверке"
                      />
                    )}

                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      {canEdit && <IconButton
                        size="small"
                        onClick={() => setIsAdding(!isAdding)}
                        sx={{ display: { xs: 'flex', md: 'none' } }}
                      >
                        {isAdding ? <Close /> : <Add />}
                      </IconButton>}

                      <Tooltip title={isCollapsed ? 'Показать' : 'Скрыть'}>
                        <IconButton
                          size="small"
                          aria-expanded={!isCollapsed}
                          aria-label={isCollapsed ? 'Показать результаты' : 'Скрыть результаты'}
                          onClick={() => setIsCollapsed(prev => !prev)}
                          sx={{ display: { xs: 'flex', md: 'none' } }}
                        >
                          {isCollapsed ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  {statusHint && !isCollapsed && (
                    <Typography
                      variant={isMobile ? "caption" : "body2"}
                      sx={{ color: 'text.secondary' }}
                    >
                      {statusHint}
                    </Typography>
                  )}
                </Box>

                {showEditControls && !isAdding && !isCollapsed && (
                  <IconButton
                    size="small"
                    sx={{ display: { xs: 'flex', md: 'none' } }}
                    onClick={() => {
                      if (isAtFileLimit) {
                        setSnackbarOpen(true, TASK_REPORT_ARCHIVE_HINT);
                        return;
                      }

                      setIsAdding(true);
                      setIsCollapsed(false);
                    }}
                  >
                    <Add />
                  </IconButton>
                )}
              </Stack>

              {status === TASK_STATUS_ENUM.COMPLETED && postId && (
                <Button
                  size="small"
                  component={Link}
                  to={getPublicationsHref({ postId, postTitle })}
                  sx={{ px: 2, flexShrink: 0, display: { xs: 'none', md: 'flex' } }}
                >
                  {publicationLinkLabel}
                </Button>
              )}
            </Stack>
          </Stack>

          {status === TASK_STATUS_ENUM.COMPLETED && postId && (
            <Button
              size="small"
              component={Link}
              to={getPublicationsHref({ postId, postTitle })}
              sx={{ px: 2, flexShrink: 0, display: { xs: 'flex', md: 'none' } }}
            >
              {publicationLinkLabel}
            </Button>
          )}

          {showEditControls && !isAdding && !isCollapsed && (
            <IconButton
              size="small"
              sx={{ display: { xs: 'flex', md: 'none' } }}
              onClick={() => {
                if (isAtFileLimit) {
                  setSnackbarOpen(true, TASK_REPORT_ARCHIVE_HINT);
                  return;
                }

                setIsAdding(true);
                setIsCollapsed(false);
              }}
            >
              <Add />
            </IconButton>
          )}

          {canEdit && hasMedia && !hasPendingFiles && !isCollapsed && (
            <IconButton
              size="small"
              onClick={() => setIsAdding(!isAdding)}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {isAdding ? <Close /> : <Add />}
            </IconButton>
          )}

          <Tooltip title={isCollapsed ? 'Показать' : 'Скрыть'}>
            <IconButton
              size="small"
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? 'Показать результаты' : 'Скрыть результаты'}
              onClick={() => setIsCollapsed(prev => !prev)}
              sx={{ display: { xs: 'none', md: 'flex' } }}
            >
              {isCollapsed ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
            </IconButton>
          </Tooltip>
        </Stack>

        <Collapse
          in={!isCollapsed}
          timeout="auto"
          unmountOnExit={false}
        >
          <Stack spacing={2.5} sx={{ pt: 2.5 }}>

            {
              hasMedia && (
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
                              bgcolor: alpha(theme.palette.background.paper, 0.92),
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
              )
            }

            {
              !hasMedia && !canEdit && (
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
              )
            }

            {
              isAtFileLimit && canEdit && (
                <Box
                  sx={{
                    py: 2,
                    px: 2,
                    textAlign: 'center',
                    borderRadius: '16px',
                    bgcolor: 'secondary.light',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {TASK_REPORT_ARCHIVE_HINT}
                  </Typography>
                </Box>
              )
            }

            {
              showDropzone && (
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
                    Фото, видео или ZIP · до {MAX_TASK_REPORT_FILES} файлов
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
              )
            }



            {
              hasPendingFiles && (
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
              )
            }
          </Stack>
        </Collapse>
      </Stack>

      <FullScreenGallery
        isOpen={galleryOpen}
        isMobile={isMobile}
        variant="phone"
        items={galleryItems}
        initialSlide={galleryInitialSlide}
        onClose={() => setGalleryOpen(false)}
      />
    </Box >
  );
};
