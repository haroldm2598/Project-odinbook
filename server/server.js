const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');
const chatRoute = require('./routes/chat');
const messageRoute = require('./routes/message');

// ===== INIT APP =====
const app = express();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
	console.log(`post is listening ${port}`);
});

// ===== CONNECT TO MONGODB =====
mongoose
	.connect(process.env.MONGO_CONNECT, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then((result) => {
		console.log('mongodb is connected');
	})
	.catch((err) => console.log(err));

// ===== MIDDLEWARE =====
app.use(
	cors({
		origin: ['http://localhost:5173'],
		credentials: true
	})
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// passport jwt
app.use(passport.initialize());
require('./config/passport');

// ===== ROUTES =====

app.get('/', (req, res) => {
	res.status(200).send('Hello welcome to odinbook');
});

app.use('/api/user', userRoute);
app.use('/api/blog', blogRoute);
app.use('/api/chat', chatRoute);
app.use('/api/message', messageRoute);

app.use((req, res) => {
	res.status(404).send('page not found');
});

// ===== WEBSOCKET =====
const io = require('socket.io')(server, {
	pingTimeout: 60000,
	cors: {
		origin: ['http://localhost:5173']
	}
});

io.on('connection', (socket) => {
	console.log('connected to socket.io');

	socket.on('setup', (userData) => {
		socket.join(userData?.user?._id);
		socket.emit('connected');
	});

	socket.on('join chat', (room) => {
		socket.join(room);
		console.log(`user joined ${room}`);
	});

	socket.on('typing', (room) => socket.in(room).emit('typing'));
	socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

	socket.on('new message', (newMessageRecieved) => {
		var chat = newMessageRecieved.chat;

		if (!chat.accounts) return console.log('not defined');

		chat.users.forEach((user) => {
			if (user._id === newMessageRecieved.sender._id) return;

			socket.in(user._id).emit('message recieved', newMessageRecieved);
		});
	});

	socket.off('setup', () => {
		console.log('USER DISCONNECTED');
		socket.leave(userData?.account?.id);
	});
});
