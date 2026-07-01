import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  fetchTaskCommentsPage,
  useTaskCommentsTailQuery,
  type Task,
  type TaskComment,
} from '@/entities';

import { DASHBOARD_COMMENTS_THREAD_LIMIT } from './constants';
import {
  sortCommentsChronologically,
  type DashboardCommentItem,
} from './utils';

const mergeUniqueComments = (
  older: TaskComment[],
  newer: TaskComment[],
): TaskComment[] => {
  const byId = new Map<string, TaskComment>();

  for (const comment of [...older, ...newer]) {
    byId.set(comment.id, comment);
  }

  return [...byId.values()].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
};

type UseDashboardTaskCommentsThreadParams = {
  taskId: string | null;
  task: Task;
  lastComment?: TaskComment;
  expanded: boolean;
  limit?: number;
};

export const useDashboardTaskCommentsThread = ({
  taskId,
  task,
  lastComment,
  expanded,
  limit = DASHBOARD_COMMENTS_THREAD_LIMIT,
}: UseDashboardTaskCommentsThreadParams) => {
  const [olderComments, setOlderComments] = useState<TaskComment[]>([]);
  const [oldestLoadedPage, setOldestLoadedPage] = useState<number | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const scrollRestoreHeightRef = useRef<number | null>(null);

  const { data: tailData, isLoading: isTailLoading } = useTaskCommentsTailQuery(
    expanded && taskId ? taskId : null,
    limit,
    expanded && Boolean(taskId),
    lastComment?.id,
  );

  useEffect(() => {
    if (!expanded) {
      setOlderComments([]);
      setOldestLoadedPage(null);
      setIsLoadingOlder(false);
      scrollRestoreHeightRef.current = null;
    }
  }, [expanded, taskId]);

  useEffect(() => {
    if (tailData?.page) {
      setOldestLoadedPage(tailData.page);
      setOlderComments([]);
    }
  }, [tailData?.page, taskId]);

  const tailComments = tailData?.items ?? [];
  const total = tailData?.total ?? 0;

  const mergedComments = useMemo(() => {
    const fromApi = mergeUniqueComments(olderComments, tailComments);

    if (fromApi.length > 0) {
      return fromApi;
    }

    return lastComment ? [lastComment] : [];
  }, [olderComments, tailComments, lastComment]);

  const items = useMemo(
    (): DashboardCommentItem[] =>
      sortCommentsChronologically(
        mergedComments.map(comment => ({ comment, task })),
      ),
    [mergedComments, task],
  );

  const hasOlder = oldestLoadedPage !== null && oldestLoadedPage > 1;

  const loadOlder = useCallback(
    async (scrollContainer?: HTMLDivElement | null) => {
      if (!taskId || !hasOlder || isLoadingOlder || oldestLoadedPage === null) {
        return;
      }

      const previousPage = oldestLoadedPage - 1;

      if (scrollContainer) {
        scrollRestoreHeightRef.current = scrollContainer.scrollHeight;
      }

      setIsLoadingOlder(true);

      try {
        const pageData = await fetchTaskCommentsPage(taskId, previousPage, limit);

        setOlderComments(prev => mergeUniqueComments(pageData.items, prev));
        setOldestLoadedPage(previousPage);
      } finally {
        setIsLoadingOlder(false);
      }
    },
    [taskId, hasOlder, isLoadingOlder, oldestLoadedPage, limit],
  );

  const consumeScrollRestoreHeight = () => {
    const height = scrollRestoreHeightRef.current;
    scrollRestoreHeightRef.current = null;
    return height;
  };

  const isInitialLoading =
    isTailLoading && tailComments.length === 0 && items.length === 0;

  const isRefreshing =
    isTailLoading && tailComments.length === 0 && items.length > 0;

  return {
    items,
    total,
    hasOlder,
    loadOlder,
    isLoadingOlder,
    isInitialLoading,
    isRefreshing,
    consumeScrollRestoreHeight,
  };
};
