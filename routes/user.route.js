const express = require('express');
const userController = require('../controllers/user.controller.js');
const verifyToken = require('../middleware/jwt.js');

const router = express.Router();

router.get("/search-users/", userController.getUsers);
router.get("/:id", userController.getUser);
router.put("/:id",verifyToken, userController.updateUser);
router.delete("/:id", verifyToken, userController.deleteUser);

module.exports = router;