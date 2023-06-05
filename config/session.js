const expressSession = require('express-session');
const MySQLStore = require('express-mysql-session');

function createSessionStore() {
    const mySQLStore = MySQLStore(expressSession);
    
    const store = new mySQLStore({
        host: 'localhost',
        database: 'fbla',
        user: 'root',
        password: 'Z+s92Bk^'
    })

    return store;
}

function createSessionConfig() {
    return {
        secret: 'super-secret',
        resave: false,
        saveUninitialized: false,
        store: createSessionStore(),
        cookie: {
            maxAge: 2 * 24 * 60 * 60 * 1000
        }
    };
}

module.exports = createSessionConfig;