const express = require('express');
const {
    addBook, getBooks, getBookDetails, searchBooks
} = require('../controllers/bookController');

const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.post('/add-book', authMiddleware, addBook);

router.get('/fetch-books', authMiddleware, getBooks);

router.get('/book-details/:id', authMiddleware, getBookDetails);

router.get('/search', authMiddleware, searchBooks);



module.exports = router;