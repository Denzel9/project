import {
  PostContentTypeEnum,
  type CreatePostDto,
  type Post,
  type PostContentType,
  type PostCooperationType,
  type UpdatePostDto,
} from '@/entities/post'

import type { FormProductType } from './schema/schema'

const CONTENT_TO_API: Record<string, PostContentType> = {
  photo: 'PHOTO',
  video: 'VIDEO',
  photoAndVideo: 'PHOTO_VIDEO',
}

const CONTENT_FROM_API: Record<PostContentType, string> = {
  PHOTO: 'photo',
  VIDEO: 'video',
  PHOTO_VIDEO: 'photoAndVideo',
}



export const mapFormToCreatePost = (form: FormProductType): CreatePostDto => ({
  title: form.title,
  chips: form.chips ?? [],
  description: form.description ?? '',
  urgent: form.urgent,
  typeCooperation: (form.typeCooperation || []) as PostCooperationType[],
  contentType: CONTENT_TO_API[form.contentType] ?? PostContentTypeEnum.PHOTO,
  photoCount: form.photoCount || null,
  videoCount: form.videoCount || null,
  finalPrice: form.finalPrice,
  rangePrice: form.rangePrice ? form.rangePrice : [],
  keyWords: form.keyWords ?? [],
  categories: form.categories ?? [],
})

export const mapFormToUpdatePost = (form: FormProductType): UpdatePostDto => ({
  ...mapFormToCreatePost(form),
})

export const mapPostToForm = (post: Post): Partial<FormProductType> => ({
  title: post.title,
  chips: post.chips,
  urgent: post.urgent,
  description: post.description,
  contentType: CONTENT_FROM_API[post.contentType] ?? PostContentTypeEnum.PHOTO,
  photoCount: post.photoCount,
  videoCount: post.videoCount,
  finalPrice: post.finalPrice ?? '',
  rangePrice: post.rangePrice ?? [],
  keyWords: post.keyWords ?? [],
  categories: post.categories ?? [],
})
