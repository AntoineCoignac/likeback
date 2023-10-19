const express = require('express');
const orderController = require('../controllers/order.controller.js');
const verifyToken = require('../middleware/jwt.js');


const router = express.Router();

router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.post("/create-payment-intent/:id", verifyToken, orderController.intent);
router.put("/", verifyToken, orderController.confirm);
router.put("/accept/:id", verifyToken, orderController.accept);
router.post("/like/:orderId", verifyToken, orderController.likeOrder);

module.exports = router;
