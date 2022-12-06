const Pool = require('pg').Pool;
require('dotenv').config({ path: '../.env'});

const pool = new Pool( {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    url: process.env.DATABASE_URL
});

module.exports = {pool};
