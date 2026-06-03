export function extractArray<T>(payload: unknown, keys: string[] = []): T[] {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const candidateKeys = [...keys, 'data', 'items', 'results'];

  for (const key of candidateKeys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
  }

  return [];
}

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedPayload<T> = {
  data: T[];
  meta: PaginationMeta;
};

const defaultMeta: PaginationMeta = {
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 1,
};

export function extractPaginated<T>(payload: unknown): PaginatedPayload<T> {
  if (!payload || typeof payload !== 'object') {
    return { data: [], meta: defaultMeta };
  }

  const record = payload as Record<string, unknown>;
  const data = Array.isArray(record.data) ? (record.data as T[]) : [];
  const metaRecord =
    record.meta && typeof record.meta === 'object'
      ? (record.meta as Record<string, unknown>)
      : {};

  return {
    data,
    meta: {
      page: Number(metaRecord.page) || defaultMeta.page,
      limit: Number(metaRecord.limit) || defaultMeta.limit,
      total: Number(metaRecord.total) || defaultMeta.total,
      totalPages: Number(metaRecord.totalPages) || defaultMeta.totalPages,
    },
  };
}
