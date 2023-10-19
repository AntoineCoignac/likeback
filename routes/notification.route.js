/*const express = require('express');
const { verifyToken } = require('../middleware/jwt.js');
const {
  createNotification,
  getNotifications,
  updateNotification
} = require('../controllers/notification.controller.js');


const router = express.Router();

router.post("/", verifyToken, createNotification);
router.get("/", verifyToken, getNotifications);
router.put("/:notificationId", verifyToken, updateNotification);

module.exports = router;*/