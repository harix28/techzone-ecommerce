const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const env = require('../src/config/env');
const { buildDbConfig } = require('../src/config/database');
const { runSeed } = require('../seed');

const runSchema = async () => {
  const schemaPath = path.resolve(__dirname, '../database/schema.sql');
  const rawSql = fs.readFileSync(schemaPath, 'utf8');
  const schemaSql = rawSql.replace(/techzone_ecommerce/g, env.db.name);
  const connection = await mysql.createConnection(buildDbConfig({ includeDatabase: false, multipleStatements: true }));

  try {
    await connection.query(schemaSql);
  } finally {
    await connection.end();
  }
};

const setupDatabase = async () => {
  await runSchema();
  await runSeed();
  console.log(`Database ${env.db.name} is ready.`);
};

if (require.main === module) {
  setupDatabase().catch((error) => {
    console.error('Database setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = {
  setupDatabase,
};
