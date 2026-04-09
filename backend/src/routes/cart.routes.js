const express = require('express');

const router = express.Router();
const controller = require('../controllers/cart.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);
router.get('/', controller.getCart);
router.post('/items', controller.addItem);
router.put('/items/:productId', controller.updateItem);
router.delete('/items/:productId', controller.removeItem);
router.delete('/', controller.clearCart);

module.exports = router;
