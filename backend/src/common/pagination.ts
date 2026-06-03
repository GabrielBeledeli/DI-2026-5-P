export type PaginationQuery = {
  page?: string;
  limit?: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export function hasPaginationQuery(query: PaginationQuery) {
  return query.page !== undefined || query.limit !== undefined;
}

export function parsePagination(query: PaginationQuery): PaginationParams {
  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1);
  const requestedLimit = Number.parseInt(query.limit ?? String(DEFAULT_LIMIT), 10);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.isFinite(requestedLimit) ? requestedLimit : DEFAULT_LIMIT),
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function toPaginatedResponse<T>(
  data: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  return {
    data,
    meta: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    },
  };
}
