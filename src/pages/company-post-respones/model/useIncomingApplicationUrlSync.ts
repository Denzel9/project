import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router';

import { replaceWindowSearch } from '@/shared/lib/url-filters';

import { useMyPostFilterStore } from './store';
import {
  incomingApplicationSearchParamsEqual,
  parseIncomingApplicationSearchParams,
  writeIncomingApplicationSearchParams,
} from './url';

export const useIncomingApplicationUrlSync = () => {
  const { pathname, search } = useLocation();
  const applyListFilters = useMyPostFilterStore(state => state.applyListFilters);
  const q = useMyPostFilterStore(state => state.q);
  const postId = useMyPostFilterStore(state => state.postId);
  const userId = useMyPostFilterStore(state => state.userId);
  const type = useMyPostFilterStore(state => state.type);
  const status = useMyPostFilterStore(state => state.status);
  const updatedDate = useMyPostFilterStore(state => state.updatedDate);

  const filters = useMemo(
    () => ({ q, postId, userId, type, status, updatedDate }),
    [q, postId, userId, type, status, updatedDate],
  );

  useLayoutEffect(() => {
    applyListFilters(
      parseIncomingApplicationSearchParams(new URLSearchParams(search)),
    );
  }, [applyListFilters, search]);

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    const current = new URLSearchParams(window.location.search);
    const next = writeIncomingApplicationSearchParams(
      current,
      filtersRef.current,
    );

    if (incomingApplicationSearchParamsEqual(current, next)) return;

    replaceWindowSearch(pathname, next);
  }, [filters, pathname]);
};
