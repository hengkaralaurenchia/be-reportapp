const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notification.controller');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, notificationController.getNotifications);
router.put('/:id/read', verifyToken, notificationController.markAsRead);
router.put('/read-all', verifyToken, notificationController.markAllAsRead);

router.delete('/:id', verifyToken, notificationController.deleteNotification);
router.delete('/', verifyToken, notificationController.deleteAllNotifications);

module.exports = router;