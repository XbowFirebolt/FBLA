const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    database: 'fbla',
    user: 'root',
    password: 'Z+s92Bk^'
});

module.exports = pool;