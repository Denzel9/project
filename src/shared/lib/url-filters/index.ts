const EMPTY_FILTER_VALUES = new Set(['', 'all', 'undefined', 'null']);

export const isEmptyFilterValue = (
  value?: string | null,
): value is undefined | null | '' | 'all' | 'undefined' | 'null' =>
  !value || EMPTY_FILTER_VALUES.has(value);

export const isFlagSearchParam = (value?: string | null) =>
  value === '1' || value === 'true';

export const setSearchParam = (
  params: URLSearchParams,
  key: string,
  value?: string | null,
) => {
  if (isEmptyFilterValue(value)) {
    params.delete(key);
    return;
  }

  params.set(key, value);
};

export const setFlagSearchParam = (
  params: URLSearchParams,
  key: string,
  value: boolean,
) => {
  if (value) {
    params.set(key, '1');
    return;
  }

  params.delete(key);
};

export const areSearchParamsEqual = (
  left: URLSearchParams,
  right: URLSearchParams,
) => {
  const leftKeys = [...left.keys()].sort();
  const rightKeys = [...right.keys()].sort();

  if (leftKeys.length !== rightKeys.length) return false;
  if (leftKeys.some((key, index) => key !== rightKeys[index])) return false;

  return leftKeys.every(key => left.get(key) === right.get(key));
};

export const replaceWindowSearch = (
  pathname: string,
  params: URLSearchParams,
) => {
  const query = params.toString();
  const hash = window.location.hash;
  const nextUrl = `${pathname}${query ? `?${query}` : ''}${hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

  if (currentUrl === nextUrl) return;

  window.history.replaceState(window.history.state, '', nextUrl);
};
