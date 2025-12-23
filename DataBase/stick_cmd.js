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

const StickCmds = sequelize.define('StickCmds', {
  no_cmd: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  stick_hash: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'stickcmds',
  timestamps: false,
});

(async () => {
  await StickCmds.sync();
})();

async function set_stick_cmd(no_cmd, stick_hash) {
  if (!no_cmd || !stick_hash) throw new Error("Commande ou URL manquante");
  await StickCmds.upsert({ no_cmd, stick_hash });
  return true;
}

async function del_stick_cmd(no_cmd) {
  if (!no_cmd) throw new Error("Commande manquante");
  const deleted = await StickCmds.destroy({ where: { no_cmd } });
  return deleted > 0;
}

async function get_stick_cmd() {
  const all = await StickCmds.findAll();
  return all.map(({ no_cmd, stick_hash }) => ({ no_cmd, stick_hash }));
}

module.exports = {
  set_stick_cmd,
  del_stick_cmd,
  get_stick_cmd,
};
