const express = require('express');
const deliveryController = require('../controllers/delivery.controller.js');
const verifyToken = require('../middleware/jwt.js');


const router = express.Router();

// Route pour créer une livraison
router.post('/create', verifyToken, deliveryController.createDelivery);

// Route pour obtenir toutes les livraisons associées à une commande
router.get('/order/:orderId', verifyToken, deliveryController.getDeliveriesByOrder);

// Route pour accepter ou refuser une livraison
router.patch('/:deliveryId', verifyToken, deliveryController.acceptOrRejectDelivery);

module.exports = router;
