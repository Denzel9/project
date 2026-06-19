import { type PostListParams } from '@/entities/post';

export const toPostListParams = (
  pagination?: { page?: number; limit?: number },
): PostListParams => ({
  page: pagination?.page ?? 1,
  limit: pagination?.limit ?? 20,
});

export const toPostInfiniteListParams = (
  pagination?: { limit?: number },
): Omit<PostListParams, 'page'> => ({
  limit: pagination?.limit ?? 20,
});
