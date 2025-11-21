const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",          // apna MySQL user
  password: "adil7250#",          // apna MySQL password
  database: "task_manager_db"
});

module.exports = pool.promise();
