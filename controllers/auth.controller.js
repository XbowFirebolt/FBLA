const db = require('../data/database');

const User = require('../models/user.model');
const authUtil = require('../util/authentication');
const validation = require('../util/validation');
const sessionFlash = require('../util/session-flash');

function getSignup(req, res) {
    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            username: '',
            email: '',
            password: '',
            confirmPassword: ''
        };
    }

    res.render('user/auth/signup', { inputData: sessionData });
}

async function signup(req, res, next) {

    const enteredData = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body['confirm-password']
    }
    
    if (!validation.userDetailsAreValid(
        req.body.username,
        req.body.email,
        req.body.password
        ) || !validation.passwordIsConfirmed(req.body.password, req.body['confirm-password'])
    ) {
        sessionFlash.flashDataToSession(req, {
            errorMessage: 'Please check your input. Password must be at least 6 characters long',
            ...enteredData
        }, 
        function() {
            res.redirect('/signup');
        })
        return;
    }

    const user = new User(
        req.body.username,
        req.body.email,
        req.body.password
        );

    try {

        const existsAlready = await user.existsAlready(next);

        if (existsAlready) {
            sessionFlash.flashDataToSession(req, {
                errorMessage: 'Username in use!',
                ...enteredData,
            }, 
            function() {
                res.redirect('/signup');
            });
            return;
        }

        await user.signup();
    } catch (error) {
        next(error);
        return;
    }
    
    res.redirect('/login');
}

function getLogin(req, res) {
    let sessionData = sessionFlash.getSessionData(req);

    if(!sessionData) {
        sessionData = {
            username: '',
            password: ''
        }
    }

    res.render('user/auth/login', { inputData: sessionData });
}

async function login(req, res, next) {
    const user = new User(
        req.body.username,
        'email',
        req.body.password
        );

    const [users] = await user.getUsers(next);

    const sessionErrorData = {
            errorMessage: 'Invalid Login - Please check username and password',
            username: user.username,
            password: user.password
    }

    if(users.length == 0) {
        sessionFlash.flashDataToSession(req, sessionErrorData, function () {
            res.redirect('/login');
        })
        return;
    }

    const existingUser = new User(
        users[0].username,
        users[0].email,
        users[0].password
    )

    const passwordIsCorrect = await user.hasMatchingPassword(existingUser.password);

    if(!passwordIsCorrect) {
        sessionFlash.flashDataToSession(req, sessionErrorData, function () {
            res.redirect('/login');
        })
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