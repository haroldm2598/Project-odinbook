const asyncHandler = require('express-async-handler');
const Message = require('../models/message.models');
const User = require('../models/user.models');
const Chat = require('../models/chat.models');

exports.sendMessage = asyncHandler(async (req, res) => {
	const { content, chatId } = req.body;

	if (!content || !chatId) {
		console.log('Invalid data passed into request');
	}

	let newMessage = {
		sender: req.user._id,
		content: content,
		chat: chatId
	};

	try {
		let message = await Message.create(newMessage);

		message = await message.populate('sender', 'name');
		message = await message.populate('chat');
		message = await User.populate(message, {
			path: 'chat.users',
			select: 'name email'
		});

		await Chat.findByIdAndUpdate(req.body.chatId, {
			latestMessage: message
		});

		res.status(200).json(message);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});

exports.allMessages = asyncHandler(async (req, res) => {
	try {
		const message = await Message.find({ chat: req.params.chatId })
			.populate('sender', 'name email')
			.populate('chat');

		res.status(200).json(message);
	} catch (err) {
		console.log(err);
		res.sendStatus(500);
	}
});
