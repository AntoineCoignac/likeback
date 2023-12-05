const express = require('express');
const codeController = require('../controllers/code.controller.js');

const router = express.Router();

router.post("/create", codeController.createCode);
router.post("/test", codeController.testCode);