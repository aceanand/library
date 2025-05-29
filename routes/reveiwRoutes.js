const express = require('express');
const router = express.Router();
const {
    addReview, updateReview, deleteReview
} = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

// Submit a review for a book
router.post('/books/:id/reviews', authMiddleware, addReview);

// Update a review
router.put('/reviews/:id', authMiddleware, updateReview);

// Delete a review
router.delete('/reviews/:id', authMiddleware, deleteReview);

module.exports = router;
