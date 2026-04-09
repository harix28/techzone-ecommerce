const express = require('express');

const router = express.Router();
const controller = require('../controllers/dashboard.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.get('/', requireAuth, requireRole('admin'), controller.getSummary);
router.get('/stats', requireAuth, requireRole('admin'), controller.getSummary);

module.exports = router;
