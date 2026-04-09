const asyncHandler = require('../utils/async-handler');
const { validateCategoryPayload } = require('../validators/category.validator');
const categoryService = require('../services/category.service');

exports.listCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories({
    includeInactive: req.user?.role === 'admin' && req.query.includeInactive === 'true',
  });

  res.json({ success: true, data: categories });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory(validateCategoryPayload(req.body));
  res.status(201).json({ success: true, data: category, message: 'Category created successfully' });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.updateCategory(Number(req.params.id), validateCategoryPayload(req.body));
  res.json({ success: true, data: category, message: 'Category updated successfully' });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(Number(req.params.id));
  res.json({ success: true, message: 'Category archived successfully' });
});
