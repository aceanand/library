const express = require('express');
const {
    signupWithMobile, loginWithMobile,
    logoutUser, deleteAccount, 
    getApiUsage // ✅ Import kiya
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');
const apiTracker = require('../middlewares/apiTracker');
const router = express.Router();

// Public route
router.post('/signup',  apiTracker, signupWithMobile);
router.post('/login', apiTracker, loginWithMobile);
// Protected routes

router.post('/logout', authMiddleware, apiTracker, logoutUser);
router.delete('/delete-account', authMiddleware, apiTracker, deleteAccount);
router.get('/api-usage', authMiddleware, getApiUsage);



module.exports = router;
