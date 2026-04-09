const asyncHandler = require('../utils/async-handler');
const dashboardService = require('../services/dashboard.service');

exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary();
  res.json({ success: true, data: summary });
});
