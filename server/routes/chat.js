const express = require('express');
const chat = require('../controllers/chat.controller');
const passport = require('passport');

const router = express.Router();
router.use(passport.authenticate('jwt', { session: false }));

router.get('/', chat.fetchChat);
router.post('/', chat.accessChat);
router.post('/group', chat.createGroupChat);
router.put('/rename', chat.renameGroup);
router.put('/groupremove', chat.removeFromGroup);
router.put('/groupadd', chat.addToGroup);

module.exports = router;
