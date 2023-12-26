const express = require("express");
const authController = require("../controllers/auth.controller.js");
const verifyToken = require('../middleware/jwt.js');

const router = express.Router();

//router.post("/register", authController.register)
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/isloggedin", authController.isLoggedIn);
router.update("/changepassword", verifyToken, authController.changePassword);

module.exports = router;