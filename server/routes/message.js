const express = require('express');
const passport = require('passport');
const message = require('../controllers/message.controller');

const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.post('/', message.sendMessage);
router.get('/:chatId', message.allMessages);

module.exports = router;
