const express = require('express');
const {
  createDelivery,
  getDeliveriesByOrder,
  acceptOrRejectDelivery
} = require('../controllers/delivery.controller.js');
const { verifyToken } = require('../middleware/jwt.js');


const router = express.Router();

// Route pour créer une livraison
router.post('/create', verifyToken, createDelivery);

// Route pour obtenir toutes les livraisons associées à une commande
router.get('/order/:orderId', verifyToken, getDeliveriesByOrder);

// Route pour accepter ou refuser une livraison
router.patch('/:deliveryId', verifyToken, acceptOrRejectDelivery);

export default router;
