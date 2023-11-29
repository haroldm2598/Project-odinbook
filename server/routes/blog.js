const express = require('express');
const passport = require('passport');
const blog = require('../controllers/blog.controller');

const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.post('/create', blog.createBlog);
// Request all pages to show
router.get('/article', blog.getBlog);
// Resquest per pages minimum
router.get('/allBlog', blog.getAllBlogs);
router.put('/like/:id', blog.like);
router.post('/comment/:id', blog.createComment);

module.exports = router;

// TESTING ROUTES
// router.get('/blog', blog.getBlogPages);
