const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

router.get('/', requireAuth, notificationController.getNotifications);
router.put('/:id/read', requireAuth, notificationController.markAsRead);
router.put('/read-all', requireAuth, notificationController.markAllAsRead);
router.post('/subscribe', requireAuth, notificationController.subscribeToPush);

module.exports = router;
