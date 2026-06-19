import {
  type CreatePostDto,
  type Post,
  type UpdatePostDto,
} from '@/entities'

import type { FormProductType } from './schema/schema'

export const mapFormToCreatePost = (form: FormProductType): CreatePostDto => ({
  title: form.title,
  chips: (form.chips ?? []) as string[],
  description: form.description ?? '',
  keyWords: (form.keyWords ?? []) as string[],
  categories: (form.categories ?? []) as string[],
})

export const mapFormToUpdatePost = (form: FormProductType): UpdatePostDto => ({
  ...mapFormToCreatePost(form),
})

export const mapPostToForm = (post: Post): Partial<FormProductType> => ({
  title: post.title,
  chips: post.chips,
  description: post.description,
  keyWords: post.keyWords ?? [],
  categories: post.categories ?? [],
})
