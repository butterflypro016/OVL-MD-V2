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

const Mention = sequelize.define('Mention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    defaultValue: 1,
  },
  mode: {
    type: DataTypes.STRING,
    defaultValue: 'non',
  },
  url: {
    type: DataTypes.TEXT,
    defaultValue: 'url',
  },
  text: {
    type: DataTypes.TEXT,
    defaultValue: 'text',
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'texte',
  }
}, {
  tableName: 'mention',
  timestamps: false,
});

(async () => {
  await Mention.sync();
  const queryInterface = sequelize.getQueryInterface();
  const tableDesc = await queryInterface.describeTable('mention');
  if (!tableDesc.type) {
    await queryInterface.addColumn('mention', 'type', {
      type: DataTypes.STRING,
      defaultValue: 'texte',
    });
  }
})();

async function setMention({ url = "url", text = "text", mode = "non", type = "texte" }) {
  await Mention.upsert({
    id: 1,
    url,
    text,
    mode,
    type,
  });
}

async function delMention() {
  const mention = await Mention.findOne({ where: { id: 1 } });

  if (mention) {
    mention.mode = "non";
    await mention.save();
  }
}

async function getMention() {
  return await Mention.findOne({ where: { id: 1 } });
}

module.exports = { setMention, delMention, getMention };
