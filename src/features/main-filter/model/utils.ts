import { POST_TYPE_ENUM, type PostListParams } from '@/entities/post';

export const toPostListParams = (
  postsType: POST_TYPE_ENUM,
  pagination?: { page?: number; limit?: number },
): PostListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
  ...(postsType !== POST_TYPE_ENUM.ALL && { type: postsType }),
});

export const toPostInfiniteListParams = (
  postsType: POST_TYPE_ENUM,
  pagination?: { limit?: number },
): Omit<PostListParams, 'page'> => ({
  limit: pagination?.limit ?? 20,
  ...(postsType !== POST_TYPE_ENUM.ALL && { type: postsType }),
});
