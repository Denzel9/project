type PaginatedResponse<T> = {
  items: T[]
  total: number
  page: number
  limit: number
}

export const fetchAllPages = async <T>(
  fetchPage: (page: number, limit: number) => Promise<PaginatedResponse<T>>,
  limit = 100,
): Promise<T[]> => {
  const items: T[] = []
  let page = 1

  while (true) {
    const data = await fetchPage(page, limit)
    items.push(...data.items)

    if (page * data.limit >= data.total) break

    page += 1
  }

  return items
}
