export const PUBLICATION_TABLE_PAGE_SIZE = 20

export const PUBLICATION_VIEW_MODE_KEY = 'publications-view-mode'

/** Минимальная ширина таблицы — на узких экранах скролл, а не сжатие колонок */
export const PUBLICATION_TABLE_MIN_WIDTH = 1040

export const PUBLICATION_TABLE_COLUMN_WIDTHS = {
  title: '15%',
  post: '15%',
  platform: '15%',
  executor: '16%',
  publishedAt: '10%',
  link: '8%',
  actions: '10%',
  media: 88,
} as const

export const SEARCH_MIN = 2;
