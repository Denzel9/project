import { fetchAllPages } from '@/shared/lib/pagination/fetchAllPages';
import { mainAxios } from '@/shared/api';
import { serializePostListParams } from '@/entities/post/model/utils';

import type { Post, PostList, PostListParams } from '@/entities/post';

export const fetchAllArchivedPosts = async (
  params: Omit<PostListParams, 'page' | 'limit'>,
): Promise<Post[]> =>
  fetchAllPages(async (page, limit) => {
    const { data } = await mainAxios.get<PostList>('/posts', {
      params: serializePostListParams({ ...params, page, limit }),
    });

    return data;
  });
