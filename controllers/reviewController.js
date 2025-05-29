const db = require('../config/db');

// POST /books/:id/reviews - Submit a review
// POST /books/:id/reviews - Add a review (authenticated users only, one per book)
exports.addReview = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user
    const bookId = req.params.id; // Book ID from URL
    const { rating, comment } = req.body;

    // Validate rating input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if the user already reviewed this book
    const [existing] = await db.query(
      'SELECT * FROM reviews WHERE user_id = ? AND book_id = ?',
      [userId, bookId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'You have already reviewed this book' });
    }

    // Insert the new review
    await db.query(
      `INSERT INTO reviews (user_id, book_id, rating, comment, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [userId, bookId, rating, comment]
    );

    res.status(201).json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Add review error:', err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// PUT /reviews/:id - Update your own review
exports.updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    // Check if the review belongs to the user
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ? AND user_id = ?', [reviewId, userId]);
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to update this review' });
    }

    await db.query(
      `UPDATE reviews SET rating = ?, comment = ?, updated_at = NOW() WHERE id = ?`,
      [rating, comment, reviewId]
    );

    res.json({ message: 'Review updated successfully' });
  } catch (err) {
    console.error('Update review error:', err);
    res.status(500).json({ error: 'Failed to update review' });
  }
};


// DELETE /reviews/:id - Delete your own review
exports.deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const reviewId = req.params.id;

    // Verify the review belongs to the logged-in user
    const [rows] = await db.query(
      'SELECT * FROM reviews WHERE id = ? AND user_id = ?',
      [reviewId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to delete this review' });
    }

    // Delete the review
    await db.query('DELETE FROM reviews WHERE id = ?', [reviewId]);

    res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Delete review error:', err);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};
