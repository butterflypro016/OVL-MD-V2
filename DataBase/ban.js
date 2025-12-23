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

const Bans = sequelize.define('Bans', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('user', 'group'),
    allowNull: false,
  },
}, {
  tableName: 'bans',
  timestamps: false,
});

const OnlyAdmins = sequelize.define('OnlyAdmins', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
}, {
  tableName: 'onlyadmins',
  timestamps: false,
});

(async () => {
  await Bans.sync();
  await OnlyAdmins.sync();
})();

module.exports = { Bans, OnlyAdmins };
