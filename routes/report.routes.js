const express = require('express')
const router = express.Router()

const reportController = require('../controller/report.controller')
const upload = require('../middlewares/upload')
const { verifyToken } = require('../middlewares/auth')
const isAdmin = require('../middlewares/admin')

// user
router.post('/', verifyToken, upload.single('image'), reportController.createReport)
router.get('/', verifyToken, reportController.getReport);
router.get('/:id', verifyToken, reportController.getReportById);
router.put('/:id', verifyToken, upload.single('image'), reportController.updateReport);
router.delete('/:id', verifyToken, reportController.deleteReport);

// admin
router.put('/:id/status', verifyToken, isAdmin, reportController.updateStatus);
router.post('/:id/fix-image', verifyToken, isAdmin, upload.single('fix_image'), reportController.uploadFixPhoto);

module.exports = router