const User = require('../models/user.models');
const Chat = require('../models/chat.models');
const asyncHandler = require('express-async-handler');

exports.accessChat = asyncHandler(async (req, res) => {
	const { userId } = req.body;

	if (!userId) {
		console.log('User ID param was not sent with request');
		res.status(400);
	}

	let isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: req.user._id } } },
			{ users: { $elemMatch: { $eq: userId } } }
		]
	})
		.populate('users', '-password')
		.populate('latestMessage');

	isChat = await User.populate(isChat, {
		path: 'latestMessage.sender',
		select: 'name email'
	});

	if (isChat.length > 0) {
		res.status(400).send(isChat[0]);
	} else {
		let chatData = {
			chatName: 'sender',
			isGroupChat: false,
			users: [req.user._id, userId]
		};

		try {
			const createChat = await Chat.create(chatData);

			const fullChat = await Chat.findOne({ _id: createChat.id }).populate(
				'users',
				'-password'
			);

			res.status(200).send(fullChat);
		} catch (err) {
			res.status(500).send({
				success: false,
				message: 'Sorry system error',
				error: err
			});
		}
	}
});

exports.fetchChat = asyncHandler(async (req, res) => {
	try {
		Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
			.populate('users', '-password')
			.populate('groupAdmin', '-password')
			.populate('latestMessage')
			.sort({ updateAt: -1 })
			.then(async (results) => {
				results = await User.populate(results, {
					path: 'latestMessage.sender',
					select: 'name email'
				});
				res.status(200).send(results);
			});
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'Sorry system error',
			error: err
		});
	}
});

exports.createGroupChat = asyncHandler(async (req, res) => {
	if (!req.body.users || !req.body.name) {
		return res.status(300).send({ message: 'please fill all the fields' });
	}

	let users = JSON.parse(req.body.users);

	if (users.length < 2) {
		res.status(300).send('Require More than 2 person in group');
	}

	users.push(req.user);

	try {
		const groupChat = await Chat.create({
			chatName: req.body.name,
			users: users,
			isGroupChat: true,
			groupAdmin: req.user
		});

		const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
			.populate('users', '-password')
			.populate('groupAdmin', '-password');

		res.status(200).json(fullGroupChat);
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'Sorry system error',
			error: err
		});
	}
});

exports.renameGroup = asyncHandler(async (req, res) => {
	const { chatId, chatName } = req.body;

	const updateChat = await Chat.findByIdAndUpdate(
		chatId,
		{
			chatName: chatName
		},
		{ new: true }
	)
		.populate('users', '-password')
		.populate('groupAdmin', '-password');

	if (!updateChat) {
		res.status(404);
		throw new Error('Chat not Found');
	} else {
		res.status(200).json(updateChat);
	}
});

exports.removeFromGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const removed = await Chat.findByIdAndUpdate(
		chatId,
		{ $pull: { users: userId } },
		{ new: true }
	)
		.populate('users', '-password')
		.populate('groupAdmin', '-password');

	if (!removed) {
		res.status(404);
		throw new Error('Chat not found');
	} else {
		res.status(200).json(removed);
	}
});

exports.addToGroup = asyncHandler(async (req, res) => {
	const { chatId, userId } = req.body;

	const added = await Chat.findByIdAndUpdate(
		chatId,
		{ $push: { users: userId } },
		{ new: true }
	)
		.populate('users', '-password')
		.populate('groupAdmin', '-password');

	if (!added) {
		res.status(404);
		throw new Error('Chat not found');
	} else {
		res.status(200).json(added);
	}
});
