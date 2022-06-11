const config = require('config');
const { Client } = require('pg');

const dbHost = config.get('DBHost');
const dbPort = config.get('DBPort');
const dbName = config.get('DBName');
const dbUser = config.get('DBUser');
const dbPassword = config.get('DBPassword');

const postgreClient = new Client({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
})

module.exports = postgreClient