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

const Antimention = sequelize.define('Antimention', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  mode: {
    type: DataTypes.STRING,
    defaultValue: 'non',
  },
  type: {
    type: DataTypes.ENUM('supp', 'warn', 'kick'),
    defaultValue: 'supp',
  },
}, {
  tableName: 'antimention',
  timestamps: false,
});

const Antimention_warnings = sequelize.define('Antimention_warnings', {
  groupId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
}, {
  tableName: 'antimention_warnings',
  timestamps: false,
});

(async () => {
  await Antimention.sync();
  await Antimention_warnings.sync();
})();

module.exports = { Antimention, Antimention_warnings };
