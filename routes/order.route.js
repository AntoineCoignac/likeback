const express = require('express');
const {
  getOrderById,
  getOrders,
  intent,
  confirm,
  accept,
  likeOrder
} = require('../controllers/order.controller.js');
const { verifyToken } = require('../middleware/jwt.js');


const router = express.Router();

router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);
router.post("/create-payment-intent/:id", verifyToken, intent);
router.put("/", verifyToken, confirm);
router.put("/accept/:id", verifyToken, accept);
router.post("/like/:orderId", verifyToken, likeOrder);

export default router;
