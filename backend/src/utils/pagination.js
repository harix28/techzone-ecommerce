const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
};

const parsePagination = (query, defaults = {}) => {
  const page = toPositiveInt(query.page, defaults.page || 1);
  const pageSize = Math.min(toPositiveInt(query.limit, defaults.pageSize || 12), defaults.maxPageSize || 50);

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
};

const buildPaginationMeta = (total, page, pageSize) => ({
  total,
  page,
  pageSize,
  totalPages: Math.max(1, Math.ceil(total / pageSize)),
});

module.exports = {
  parsePagination,
  buildPaginationMeta,
};
