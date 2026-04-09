const express = require('express');

const router = express.Router();
const controller = require('../controllers/product.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/', controller.listProducts);
router.get('/featured', (req, res, next) => {
  req.query.featured = true;
  req.query.limit = req.query.limit || 8;
  controller.listProducts(req, res, next);
});
router.get('/admin/all', requireAuth, requireRole('admin'), controller.listAdminProducts);
router.get('/:id/reviews', controller.listReviews);
router.post('/:id/reviews', requireAuth, controller.createReview);
router.get('/:id', controller.getProduct);
router.post('/', requireAuth, requireRole('admin'), controller.createProduct);
router.put('/:id', requireAuth, requireRole('admin'), controller.updateProduct);
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteProduct);

module.exports = router;
