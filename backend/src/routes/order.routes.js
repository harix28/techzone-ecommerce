const express = require('express');

const router = express.Router();
const controller = require('../controllers/order.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use(requireAuth);
router.post('/', controller.checkout);
router.get('/my', controller.listMyOrders);
router.get('/', requireRole('admin'), controller.listOrders);
router.put('/:id/status', requireRole('admin'), controller.updateStatus);
router.get('/:id', controller.getOrder);

module.exports = router;
