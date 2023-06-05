const db = require('../data/database');

const User = require('../models/user.model');
const authUtil = require('../util/authentication');

async function getSignup(req, res) {
    const [users] = await db.query('SELECT * FROM fbla.users');
    res.render('user/auth/signup', {users: users});
}

async function signup(req, res) {
    const user = new User(
        req.body.username,
        req.body.email,
        req.body.password
        );
    
    await user.signup();

    res.redirect('/login');
}

function getLogin(req, res) {
    res.render('user/auth/login');
}

async function login(req, res) {
    const user = new User(
        req.body.username,
        req.body.email,
        req.body.password
        );
    const existingUser = await user.getUserWithSameUsername();

    if(!existingUser) {
        res.redirect('/login');
        return;
    }

    const passwordIsCorrect = await user.hasMatchingPassword(existingUser.password);

    if(!passwordIsCorrect) {
        res.redirect('/login');
        return;
    }

    authUtil.createUserSession(req, existingUser, function() {
        res.redirect('/');
    });
}

module.exports = {
    getSignup: getSignup,
    getLogin: getLogin,
    signup: signup
};