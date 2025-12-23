const { Sequelize, DataTypes } = require('sequelize');
const config = require('../set');
const db = config.DATABASE;

let sequelize;

if (!db) {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.db',
    logging: false,
  });
} else {
  sequelize = new Sequelize(db, {
    dialect: 'postgres',
    ssl: true,
    protocol: 'postgres',
    dialectOptions: {
      native: true,
      ssl: { require: true, rejectUnauthorized: false },
    },
    logging: false,
  });
}

const ChatbotConf = sequelize.define('ChatbotConf', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  chatbot_pm: {
    type: DataTypes.ENUM('oui', 'non'),
    defaultValue: 'non',
  },
  chatbot_gc: {
    type: DataTypes.ENUM('oui', 'non'),
    defaultValue: 'non',
  },
  enabled_ids: {
  type: DataTypes.TEXT,
  allowNull: false,
  defaultValue: '[]',
  },
}, {
  tableName: 'chatbot_config',
  timestamps: false,
});

(async () => {
  await ChatbotConf.sync();
})();

module.exports = { ChatbotConf };
