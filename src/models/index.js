const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create the Sequelize instance first
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect
  }
);

// Import models
const User = require('./users');

// Initialize models
const models = {
  User: User(sequelize),
  sequelize
};

// Export models
module.exports = models;