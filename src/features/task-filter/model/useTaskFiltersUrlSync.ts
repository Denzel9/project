import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';

import type { TaskStatus } from '@/entities';
import { replaceWindowSearch } from '@/shared/lib/url-filters';

import { useMyTaskFilterStore } from './store';
import {
  parseTaskFiltersSearchParams,
  parseTaskScrollParam,
  writeTaskFiltersSearchParams,
  taskFiltersSearchParamsEqual,
} from './url';

type UseTaskFiltersUrlSyncOptions = {
  includePeriod?: boolean;
  onScrollColumn?: (status: TaskStatus) => void;
};

export const useTaskFiltersUrlSync = ({
  includePeriod = false,
  onScrollColumn,
}: UseTaskFiltersUrlSyncOptions = {}) => {
  const { pathname, search } = useLocation();
  const onScrollColumnRef = useRef(onScrollColumn);
  onScrollColumnRef.current = onScrollColumn;
  const applyListFilters = useMyTaskFilterStore(state => state.applyListFilters);
  const postId = useMyTaskFilterStore(state => state.postId);
  const executorId = useMyTaskFilterStore(state => state.executorId);
  const status = useMyTaskFilterStore(state => state.status);
  const extraFilter = useMyTaskFilterStore(state => state.extraFilter);
  const fastButtonValue = useMyTaskFilterStore(state => state.fastButtonValue);
  const activeOnly = useMyTaskFilterStore(state => state.activeOnly);
  const onlyMyTasks = useMyTaskFilterStore(state => state.onlyMyTasks);
  const assigneeAccountId = useMyTaskFilterStore(
    state => state.assigneeAccountId,
  );
  const updatedDate = useMyTaskFilterStore(state => state.updatedDate);
  const searchQuery = useMyTaskFilterStore(state => state.searchQuery);
  const period = useMyTaskFilterStore(state => state.period);

  const filters = useMemo(
    () => ({
      postId,
      executorId,
      status,
      extraFilter,
      fastButtonValue,
      activeOnly,
      onlyMyTasks,
      assigneeAccountId,
      updatedDate,
      searchQuery,
      period,
    }),
    [
      postId,
      executorId,
      status,
      extraFilter,
      fastButtonValue,
      activeOnly,
      onlyMyTasks,
      assigneeAccountId,
      updatedDate,
      searchQuery,
      period,
    ],
  );

  useLayoutEffect(() => {
    const searchParams = new URLSearchParams(search);

    applyListFilters(parseTaskFiltersSearchParams(searchParams), {
      includePeriod,
    });

    const scroll = parseTaskScrollParam(searchParams);

    if (scroll) {
      onScrollColumnRef.current?.(scroll);
    }
  }, [applyListFilters, includePeriod, search]);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const next = writeTaskFiltersSearchParams(current, filtersRef.current, {
      includePeriod,
    });

    if (taskFiltersSearchParamsEqual(current, next)) return;

    replaceWindowSearch(pathname, next);
  }, [filters, includePeriod, pathname]);
};
