const Blog = require('../models/blog.models');
const asyncHandler = require('express-async-handler');

// controller where limit show per 5 pages
exports.getAllBlogs = asyncHandler(async (req, res) => {
	try {
		const page = parseInt(req.query.page);
		const size = parseInt(req.query.size);

		const skip = (page - 1) * size;

		const total = await Blog.countDocuments();
		const blogs = await Blog.find()
			.sort({ createdAt: -1 })
			.populate('userName', '-password')
			.skip(skip)
			.limit(size);

		res.status(200).json({
			blogs: blogs,
			total,
			page,
			size
		});
	} catch (err) {
		res.status(404).json(err);
	}
});

// controller where show all blogs
exports.getBlog = asyncHandler(async (req, res) => {
	try {
		const blog = await Blog.find()
			.sort({ createdAt: -1 })
			.populate('userName', '-password')
			.exec();

		res.status(200).json({ blog });
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'something went error',
			error: err
		});
	}
});

exports.createBlog = asyncHandler(async (req, res) => {
	try {
		const blogExist = await Blog.findOne({ content: req.body.content });

		if (!blogExist) {
			const newBlog = new Blog({
				content: req.body.content,
				userName: req.user._id
			});

			await newBlog.save();
			console.log('Blog create!');
		} else {
			console.log('Blog is already exist');
		}
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'something went error',
			error: err
		});
	}
});

exports.like = asyncHandler(async (req, res) => {
	try {
		const { id } = req.params;
		const { userId } = req.body;

		const post = await Blog.findById(id);
		const index = post.likes.findIndex((pid) => pid !== userId);

		if (index === -1) {
			post.likes.push(userId);
		} else {
			post.likes = post.likes.filter((pid) => pid !== userId);
		}

		const newPost = await Blog.findByIdAndUpdate(id, post, {
			new: true
		});

		res.status(200).json({
			success: true,
			blogLikes: newPost
		});
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'something went error',
			error: err
		});
	}
});

exports.createComment = asyncHandler(async (req, res) => {
	try {
		const { id } = req.params;
		const { comment } = req.body;

		const blogPost = await Blog.findById(id);

		blogPost.comments.push(comment);

		const updateBlogPost = await Blog.findByIdAndUpdate(id, blogPost, {
			new: true
		});

		res.status(200).json(updateBlogPost);
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'something went error',
			error: err
		});
	}
});

// TESTING PURPOSES
// exports.getBlogPages = asyncHandler(async (req, res) => {
// 	const skip = req.query.skip ? Number(req.query.skip) : 0;
// 	const DEFAULT_LIMIT = 5;

// 	try {
// 		const blog = await Blog.find({})
// 			.sort({ createdAt: -1 })
// 			.populate('userName', '-password')
// 			.skip(skip)
// 			.limit(DEFAULT_LIMIT);

// 		res.status(200).json({
// 			success: true,
// 			blog: blog
// 		});
// 	} catch (err) {
// 		res.status(500).send({
// 			success: false,
// 			message: 'something went error',
// 			error: err
// 		});
// 	}
// });
