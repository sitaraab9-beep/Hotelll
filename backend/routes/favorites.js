const express = require('express');
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, addFavorite);
router.delete('/:hotelId', auth, removeFavorite);
router.get('/', auth, getFavorites);

module.exports = router;