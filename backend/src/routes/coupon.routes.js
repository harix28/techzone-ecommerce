const express = require('express');

const router = express.Router();
const controller = require('../controllers/coupon.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/validate', controller.validateCoupon);
router.get('/', requireAuth, requireRole('admin'), controller.listCoupons);
router.post('/', requireAuth, requireRole('admin'), controller.createCoupon);
router.put('/:id', requireAuth, requireRole('admin'), controller.updateCoupon);
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteCoupon);

module.exports = router;
