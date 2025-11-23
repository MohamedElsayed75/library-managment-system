// db.js
const mysql = require("mysql2/promise");

async function connect() {
    const conn = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "1234567",
        database: "library"
    });

    return conn;
}

module.exports = { connect };
