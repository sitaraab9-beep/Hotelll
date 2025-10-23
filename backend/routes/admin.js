const express = require('express');
const { getAllUsers, deleteUser, updateUserRole } = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/users', auth, adminOnly, getAllUsers);
router.delete('/users/:id', auth, adminOnly, deleteUser);
router.put('/users/:id/role', auth, adminOnly, updateUserRole);

module.exports = router;