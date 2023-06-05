function createUserSession(req, user, action) {
    const userId = db.query('SELECT (id) FROM fbla.users WHERE username = ?', [user.username]);
    req.session.uid = userId.toString();
    req.session.save(action);
}

module.exports = {
    createUserSession: createUserSession
}