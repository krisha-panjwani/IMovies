const express = require('express');
const { listMoods, getRecommendations } = require('../controllers/cinemood.controller');

const router = express.Router();

router.get('/moods', listMoods);
router.get('/recommendations', getRecommendations);

module.exports = router;
