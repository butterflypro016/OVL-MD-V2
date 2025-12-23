const { Sequelize, DataTypes } = require("sequelize");
const config = require("../set");
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

const WA_CONF = sequelize.define(
  "WA_CONF",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    presence: {
      type: DataTypes.STRING,
      defaultValue: "rien",
    },
    lecture_status: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    like_status: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    dl_status: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antivv: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    antidelete: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    mention: {
      type: DataTypes.STRING,
      defaultValue: "1",
    },
  },
  {
    tableName: "wa_conf",
    timestamps: false,
  }
);

const WA_CONF2 = sequelize.define(
  "WA_CONF2",
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    autoreact_msg: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    anticall: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
    autoread_msg: {
      type: DataTypes.STRING,
      defaultValue: "non",
    },
  },
  {
    tableName: "wa_conf2",
    timestamps: false,
  }
);

(async () => {
  await WA_CONF.sync();
  await WA_CONF2.sync();

  const rowsToUpdate = await WA_CONF.findAll({ where: { mention: "non" } });
  for (const row of rowsToUpdate) {
    row.mention = "1";
    await row.save();
  }
  
})();

module.exports = { WA_CONF, WA_CONF2 };
