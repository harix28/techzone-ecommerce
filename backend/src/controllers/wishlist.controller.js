const asyncHandler = require('../utils/async-handler');
const wishlistService = require('../services/wishlist.service');
const { requiredInteger } = require('../utils/validation');

exports.getWishlist = asyncHandler(async (req, res) => {
  const items = await wishlistService.listWishlist(req.user.id);
  res.json({ success: true, data: items });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const result = await wishlistService.toggleWishlist(
    req.user.id,
    requiredInteger(req.params.productId, 'Product', { min: 1 }),
  );

  res.json({
    success: true,
    data: result.items,
    message: result.action === 'added' ? 'Product saved to wishlist' : 'Product removed from wishlist',
  });
});
