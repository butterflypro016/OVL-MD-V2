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

const Ranks = sequelize.define('Ranks', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  exp: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  messages: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  }
}, {
  tableName: 'ranks',
  timestamps: false,
});

const Levelup = sequelize.define('Levelup', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  levelup: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: 'non'
  }
}, {
  tableName: 'levelup',
  timestamps: false,
});

(async () => {
  await Ranks.sync();
  await Levelup.sync();
})();

module.exports = { Ranks, Levelup };
