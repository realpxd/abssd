/**
 * Pagination utility for list endpoints
 */
const getPaginationParams = (req) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const getPaginationResponse = (page, limit, total, data) => {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    data,
  };
};

module.exports = {
  getPaginationParams,
  getPaginationResponse,
};
