import {
  type CreatePostDto,
  type Post,
  type UpdatePostDto,
} from '@/entities'

import type { FormProductType } from './schema/schema'

const parseStringArray = (values?: (string | undefined)[]) =>
  values
    ?.map(item => item?.trim())
    .filter((item): item is string => Boolean(item)) ?? []

export const mapFormToCreatePost = (form: FormProductType): CreatePostDto => {
  const chips = parseStringArray(form.chips)
  const keyWords = parseStringArray(form.keyWords)
  const categories = parseStringArray(form.categories)

  return {
    title: form.title,
    urgent: false,
    ...(form.description?.trim() && { description: form.description.trim() }),
    ...(chips.length > 0 && { chips }),
    ...(keyWords.length > 0 && { keyWords }),
    ...(categories.length > 0 && { categories }),
  }
}

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
