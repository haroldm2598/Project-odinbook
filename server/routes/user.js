const express = require('express');
const passport = require('passport');
const user = require('../controllers/user.controller');

const router = express.Router();

router.post('/register', user.register);
router.post('/login', user.login);
router.get(
	'/protected',
	passport.authenticate('jwt', { session: false }),
	user.protected
);
router.get(
	'/s',
	passport.authenticate('jwt', { session: false }),
	user.allUser
);

module.exports = router;
