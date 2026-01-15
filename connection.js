const mysql = require('mysql2');
const util = require('util');

require('dotenv').config();

// HOST=localhost
// USER=root
// PASSWORD=admin
// DATABASE=coaching_db
// PORT=1000

var conn = mysql.createConnection({
    host: process.env.HOST || 'localhost',
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

var exe = util.promisify(conn.query).bind(conn);

module.exports = exe;