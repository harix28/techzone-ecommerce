const asyncHandler = require('../utils/async-handler');
const productService = require('../services/product.service');
const reviewService = require('../services/review.service');
const { validateProductPayload } = require('../validators/product.validator');
const { validateReviewPayload } = require('../validators/review.validator');

exports.listProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query);
  res.json({ success: true, data: result.items, meta: result.meta });
});

exports.listAdminProducts = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.query, { adminView: true });
  res.json({ success: true, data: result.items, meta: result.meta });
});

exports.getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id, {
    includeInactive: req.user?.role === 'admin',
  });
  const reviews = await reviewService.listProductReviews(product.id);

  res.json({
    success: true,
    data: {
      ...product,
      reviews,
    },
  });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(validateProductPayload(req.body));
  res.status(201).json({ success: true, data: product, message: 'Product created successfully' });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(Number(req.params.id), validateProductPayload(req.body));
  res.json({ success: true, data: product, message: 'Product updated successfully' });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(Number(req.params.id));
  res.json({ success: true, message: 'Product archived successfully' });
});

exports.listReviews = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  const reviews = await reviewService.listProductReviews(product.id);
  res.json({ success: true, data: reviews });
});

exports.createReview = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  const review = await reviewService.createReview(req.user.id, product.id, validateReviewPayload(req.body));
  res.status(201).json({ success: true, data: review, message: 'Review submitted successfully' });
});
