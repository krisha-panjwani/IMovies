const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const ctrl = require('../controllers/favorite.controller');

const router = express.Router();

// Favourites belong to a user, so every route needs a login.
router.use(protect);

router.get('/', ctrl.listFavorites);
router.post('/', body('movieId').isMongoId().withMessage('Invalid movie'), validate, ctrl.addFavorite);
router.delete('/:movieId', param('movieId').isMongoId().withMessage('Invalid movie'), validate, ctrl.removeFavorite);

module.exports = router;
