"use strict";
const Pool = require('pg').Pool;
require('dotenv').config({ path: '../.env' });
const devConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT
};
const proConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
};
const pool = new Pool(process.env.NODE_ENV === "production" ? proConfig : devConfig);
module.exports = { pool };
