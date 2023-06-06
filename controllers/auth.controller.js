const db = require('../data/database');

const User = require('../models/user.model');
const authUtil = require('../util/authentication');
const validation = require('../util/validation');

async function getSignup(req, res) {
    const [users] = await db.query('SELECT * FROM fbla.users');
    res.render('user/auth/signup', {users: users});
}

async function signup(req, res, next) {
    const user = new User(
        req.body.username,
        req.body.email,
        req.body.password
        );
    
    try {
        await user.signup();
    } catch (error) {
        next(error);
        return;
    }
    
    if (!validation.userDetailsAreValid(
        req.body.username,
        req.body.email,
        req.body.password
        ) || validation.passwordIsConfirmed(req.body.password, req.body['confirm-password'])
    ) {
        res.redirect('/signup');
        return;
    }

    res.redirect('/login');
}

function getLogin(req, res) {
    res.render('user/auth/login');
}

async function login(req, res, next) {
    const user = new User(
        req.body.username,
        'email',
        req.body.password
        );

    const [users] = await user.getUsers(next);

    if(users.length == 0) {
        res.redirect('/login');
        return;
    }

    const existingUser = new User(
        users[0].username,
        users[0].email,
        users[0].password
    )

    const passwordIsCorrect = await user.hasMatchingPassword(existingUser.password);

    if(!passwordIsCorrect) {
        res.redirect('/login');
        return;
    }

    authUtil.createUserSession(req, existingUser, function() {
        res.redirect('/');
    });
}

function logout(req, res) {
    authUtil.destroyUserAuthSession(req);
    res.redirect('/');
}

module.exports = {
    getSignup: getSignup,
    getLogin: getLogin,
    signup: signup,
    login: login,
    logout: logout
};