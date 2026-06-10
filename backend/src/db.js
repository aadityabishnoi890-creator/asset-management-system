const { Pool } = require("pg");

const pool = new Pool({
  user: "aadityaskhichar",
  host: "localhost",
  database: "asset_management_db",
  port: 5432,
});

module.exports = pool;