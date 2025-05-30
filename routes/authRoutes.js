const express = require('express');
const {
    signup, login,


} = require('../controllers/authController');



const router = express.Router();

// Public route
router.post('/signup', signup);
router.post('/login', login);
// Protected routes





module.exports = router;