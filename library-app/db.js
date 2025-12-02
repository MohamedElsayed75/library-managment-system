// db.js
const mysql = require("mysql2/promise");

async function connect() {
    try{
        const conn = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "password123",
            database: "librarydb",
            port: 3306
        });

        console.log("Database connected.")
        return conn;
    }
 catch (error) {
    console.error("Database not connected", error.message);
    throw error;
}
}
module.exports = { connect };
