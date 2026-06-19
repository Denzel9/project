import type {
  Post,
  PostCooperationType,
  PostContentType,
  PostMedia,
  PostType,
} from './types'
import type { Application } from '@/entities/application';
import type { Photo } from '@/entities/photo'

export const getPostTypeLabel = (type: PostType): string =>
  type === 'COMPANY' ? 'Компания' : 'Креатор';

export const getContentTypeLabel = (contentType: PostContentType): string => {
  switch (contentType) {
    case 'PHOTO':
      return 'Только фото';
    case 'VIDEO':
      return 'Только видео';
    case 'PHOTO_VIDEO':
      return 'Видео и фото';
    default:
      return '—';
  }
};

export const getCooperationTypeLabel = (type: PostCooperationType): string => {
  switch (type) {
    case 'ONE_TIME':
      return 'Разовое сотрудничество';
    case 'LONG_TIME':
      return 'Постоянное сотрудничество';
    default:
      return '—';
  }
};

export const getCooperationTypesLabel = (
  types: PostCooperationType[]
): string => {
  if (!types?.length) return '—';
  return types.map(getCooperationTypeLabel).join(', ');
};

const formatPriceNumber = (value: string): string => {
  const num = Number(value.replace(/\s/g, ''));

  if (Number.isNaN(num)) return value;

  return num.toLocaleString('ru-RU');
};

export const formatPostPrice = (
  finalPrice: string,
  rangePrice: string[]
): string => {
  if (finalPrice?.trim()) {
    return `${formatPriceNumber(finalPrice)} ₽`;
  }

  const [from, to] = rangePrice ?? [];

  if (from?.trim() && to?.trim()) {
    return `от ${formatPriceNumber(from)} до ${formatPriceNumber(to)} ₽`;
  }

  if (from?.trim()) {
    return `от ${formatPriceNumber(from)} ₽`;
  }

  return '—';
};

export const formatPostContentCount = (
  post: Pick<Post, 'contentType' | 'photoCount' | 'videoCount'>
): string => {
  const parts: string[] = [];

  if (post.contentType === 'PHOTO' || post.contentType === 'PHOTO_VIDEO') {
    if (post.photoCount?.trim()) {
      parts.push(`${post.photoCount} фото`);
    }
  }

  if (post.contentType === 'VIDEO' || post.contentType === 'PHOTO_VIDEO') {
    if (post.videoCount?.trim()) {
      parts.push(`${post.videoCount} видео`);
    }
  }

  return parts.length > 0 ? parts.join(', ') : '—';
};

export const mapPostMediaToPhotos = (media: PostMedia[]): Photo[] =>
  media.map(item => ({
    id: item.id,
    url: item.url,
    key: item.key,
    mimeType: item.mimeType,
    size: item.size,
  }))

export const getApplicationsCountLabel = (applications: Application[]) => {
  if (applications.length === 0) return '0 откликов';
  if (applications.length === 1) return '1 отклик';
  if (applications.length > 1 && applications.length <= 4) return `${applications.length} отклика`;
  return `${applications.length} откликов`;
};
