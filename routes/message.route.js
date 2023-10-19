const express = require('express');
const verifyToken = require('../middleware/jwt.js');
const messageController = require('../controllers/message.controller.js');


const router = express.Router();

router.get("/messages/:id", verifyToken, messageController.getMessages);
router.get("/conversations", verifyToken, messageController.getConversations);
router.post("/", verifyToken, messageController.createMessage);


module.exports = router;