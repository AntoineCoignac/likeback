const express = require('express');
const gigController = require('../controllers/gig.controller.js');
const verifyToken = require('../middleware/jwt.js');


const router = express.Router();

router.post("/", verifyToken, gigController.createGig);
router.delete("/:id", verifyToken, gigController.deleteGig);
router.put("/:id", verifyToken, gigController.updateGig);
router.get("/single/:id", gigController.getGig);
router.get("/", gigController.getGigs);

module.exports = router;