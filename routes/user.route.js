const express = require('express');
const {
  deleteUser,
  getUser,
  updateUser,
  getUsers
} = require('../controllers/user.controller.js');
const { verifyToken } = require('../middleware/jwt.js');


const router = express.Router();

router.delete("/:id",verifyToken, deleteUser);
router.get("/search-users/", getUsers);
router.get("/:id", getUser);
router.put("/:id",verifyToken, updateUser);

export default router;