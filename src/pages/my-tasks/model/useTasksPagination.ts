import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import { scrollMainToTop } from '@/shared';

import { TASK_TABLE_PAGE_SIZE } from './constants';

type UseTasksPaginationOptions = {
  rowsPerPage?: number;
  scrollTargetRef?: RefObject<HTMLElement | null>;
  scrollMain?: boolean;
};

export const useTasksPagination = <T,>(
  items: T[],
  resetKey: string,
  {
    rowsPerPage = TASK_TABLE_PAGE_SIZE,
    scrollTargetRef,
    scrollMain = true,
  }: UseTasksPaginationOptions = {},
) => {
  const [page, setPage] = useState(0);
  const resetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (resetKeyRef.current === resetKey) return;

    resetKeyRef.current = resetKey;
    setPage(0);
  }, [resetKey]);

  const pageCount = Math.max(1, Math.ceil(items.length / rowsPerPage));
  const currentPage = Math.min(page, pageCount - 1);

  const paginatedItems = useMemo(() => {
    const start = currentPage * rowsPerPage;

    return items.slice(start, start + rowsPerPage);
  }, [items, currentPage, rowsPerPage]);

  const showPagination = items.length > rowsPerPage;

  const scrollToTop = () => {
    scrollTargetRef?.current?.scrollTo({ top: 0, behavior: 'smooth' });

    if (scrollMain) {
      scrollMainToTop('smooth');
    }
  };

  const handlePageChange = (_: unknown, nextPage: number) => {
    setPage(nextPage);
    scrollToTop();
  };

  return {
    page: currentPage,
    rowsPerPage,
    totalCount: items.length,
    paginatedItems,
    showPagination,
    onPageChange: handlePageChange,
    scrollToTop,
  };
};
