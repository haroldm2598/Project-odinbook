const User = require('../models/user.models');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = asyncHandler(async (req, res) => {
	try {
		const findUser = await User.findOne({ email: req.body.email });

		if (!findUser) {
			const salt = await bcrypt.genSalt(10);
			const hashPassword = await bcrypt.hash(req.body.password, salt);
			const newUser = new User({
				name: req.body.name,
				email: req.body.email,
				password: hashPassword
			});

			await newUser.save();
			res.status(200).send({
				success: true,
				message: 'User is created',
				user: {
					id: newUser._id,
					name: newUser.name,
					email: newUser.email
				}
			});
		} else {
			res.status(400).send('User is already created please try another');
		}
	} catch (err) {
		console.log(err);
		res.send({
			success: false,
			message: 'Something went wrong',
			error: err
		});
	}
});

exports.login = asyncHandler(async (req, res) => {
	try {
		const { email, password } = req.body;
		const findUser = await User.findOne({ email: email });
		const passwordCorrect = await bcrypt.compare(password, findUser.password);

		if (!passwordCorrect) {
			return res.status(401).send({
				success: false,
				message: 'Incorrect email or password'
			});
		}

		const payload = {
			email: findUser.email,
			id: findUser._id
		};
		const token = jwt.sign(payload, 'sansa', { expiresIn: '1d' });

		return res.status(200).send({
			success: true,
			message: 'Logged in sucessfully',
			token: 'Bearer ' + token
		});
	} catch (err) {
		res.status(500).send({
			success: false,
			message: 'server error'
		});
	}
});

exports.protected = (req, res) => {
	return res.status(200).send({
		success: true,
		user: {
			_id: req.user._id,
			email: req.user.email,
			name: req.user.name,
			isAdmin: req.user.isAdmin
		}
	});
};

exports.allUser = asyncHandler(async (req, res) => {
	const keyword = req.query.search
		? {
				$or: [
					{ name: { $regex: req.query.search, $options: 'i' } },
					{ email: { $regex: req.query.search, $options: 'i' } }
				]
		  }
		: {};

	const user = await User.find(keyword).find({
		_id: { $ne: req.user._id }
	});
	res.send(user);
});
