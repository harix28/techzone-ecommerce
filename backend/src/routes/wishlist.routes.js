const express = require('express');

const router = express.Router();
const controller = require('../controllers/wishlist.controller');
const { requireAuth } = require('../middlewares/auth');

router.use(requireAuth);
router.get('/', controller.getWishlist);
router.post('/:productId', controller.toggleWishlist);

module.exports = router;
