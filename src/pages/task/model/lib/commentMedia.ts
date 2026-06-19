import type { TaskCommentAttachment, TaskCommentMedia } from '@/entities/task';
import type { MediaItemType } from '@/widgets/media/model/types';

export const COMMENT_MEDIA_PLACEHOLDER = '\u00A0';

export const isGalleryMedia = (mimeType: string) =>
  mimeType.startsWith('image/') || mimeType.startsWith('video/');

export const toGalleryItems = (
  media: Array<{ url: string; mimeType: string }>,
): MediaItemType[] =>
  media.filter(item => isGalleryMedia(item.mimeType)).map(item => ({
    url: item.url,
    mimeType: item.mimeType,
  }));

export const getGallerySlideIndex = (
  media: TaskCommentMedia[],
  clickedIndex: number,
): number => {
  const galleryItems = toGalleryItems(media);
  const clicked = media[clickedIndex];

  if (!clicked) return 0;

  return Math.max(
    0,
    galleryItems.findIndex(item => item.url === clicked.url),
  );
};

export const getAttachmentGalleryIndex = (
  items: TaskCommentAttachment[],
  clickedIndex: number,
): number => {
  const galleryItems = toGalleryItems(items);
  const clicked = items[clickedIndex];

  if (!clicked) return 0;

  return Math.max(
    0,
    galleryItems.findIndex(item => item.url === clicked.url),
  );
};

export const hasCommentText = (content: string) =>
  Boolean(content.trim()) && content !== COMMENT_MEDIA_PLACEHOLDER;
