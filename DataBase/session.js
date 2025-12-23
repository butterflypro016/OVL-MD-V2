const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function get_session(id) {
  if (!id) throw new Error("ID requis");

  const url = `https://ovl-web.koyeb.app/getsession?id=${id}`;

  try {
    const response = await axios.get(url);
    if (!response.data) return null;

    return {
      creds: response.data.creds,
      keys: response.data.keys,
    };
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    throw new Error(`Erreur API: ${err.message}`);
  }
}

async function restaureAuth(instanceId, creds, keys) {
  const authDir = path.join(__dirname, '../auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const sessionDir = path.join(authDir, instanceId);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(creds));

  if (keys && Object.keys(keys).length > 0) {
    for (const keyFile in keys) {
      fs.writeFileSync(
        path.join(sessionDir, `${keyFile}.json`),
        JSON.stringify(keys[keyFile])
      );
    }
  }
}

module.exports = {
  get_session,
  restaureAuth
};
