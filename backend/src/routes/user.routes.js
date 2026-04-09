const express = require('express');

const router = express.Router();
const controller = require('../controllers/user.controller');
const { requireAuth, requireRole } = require('../middlewares/auth');

router.use(requireAuth);
router.get('/profile', controller.getProfile);
router.put('/profile', controller.updateProfile);
router.get('/addresses', controller.listAddresses);
router.post('/addresses', controller.createAddress);
router.put('/addresses/:id', controller.updateAddress);
router.delete('/addresses/:id', controller.deleteAddress);
router.get('/', requireRole('admin'), controller.listUsers);
router.put('/:id', requireRole('admin'), controller.updateUser);

module.exports = router;
