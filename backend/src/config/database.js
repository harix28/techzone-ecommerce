const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  user: env.db.user,
  password: env.db.password,
  waitForConnections: true,
  connectionLimit: env.db.connectionLimit,
  decimalNumbers: true,
  supportBigNumbers: true,
});

const query = async (sql, params = [], connection = pool) => {
  const [rows] = await connection.query(sql, params);
  return rows;
};

const one = async (sql, params = [], connection = pool) => {
  const rows = await query(sql, params, connection);
  return rows[0] || null;
};

const execute = async (sql, params = [], connection = pool) => {
  const [result] = await connection.execute(sql, params);
  return result;
};

const withTransaction = async (callback) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const testConnection = async () => {
  const row = await one('SELECT 1 AS ok');
  return row?.ok === 1;
};

module.exports = {
  pool,
  query,
  one,
  execute,
  withTransaction,
  testConnection,
};
