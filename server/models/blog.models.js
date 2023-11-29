const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema(
	{
		content: { type: String, required: true },
		userName: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		comments: { type: [String], default: [] }
	},
	{ timestamps: true }
);

const Blog = mongoose.model('Blog', BlogSchema);
module.exports = Blog;
