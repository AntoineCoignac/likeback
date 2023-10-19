const express = require('express');
const { verifyToken } = require('../middleware/jwt.js');
const {
  createMessage,
  getMessages,
  getConversations
} = require('../controllers/message.controller.js');


const router = express.Router();

router.get("/messages/:id", verifyToken, getMessages);
router.get("/conversations", verifyToken, getConversations);
router.post("/", verifyToken, createMessage);


export default router;