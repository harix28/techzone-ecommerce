const express = require('express');

const router = express.Router();
const controller = require('../controllers/category.controller');
const { optionalAuth, requireAuth, requireRole } = require('../middlewares/auth');

router.get('/', optionalAuth, controller.listCategories);
router.post('/', requireAuth, requireRole('admin'), controller.createCategory);
router.put('/:id', requireAuth, requireRole('admin'), controller.updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteCategory);

module.exports = router;
