const express = require('express');

const db = require('../data/database');

const authConrtoller = require("../controllers/auth.controller");

const router = express.Router();

router.get('/signup', authConrtoller.getSignup);

router.post('/signup', authConrtoller.signup);

router.get('/login', authConrtoller.getLogin);

router.post('/login', authConrtoller.login);

router.post('/logout', authConrtoller.logout);

module.exports = router;