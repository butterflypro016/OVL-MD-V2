const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const ENV_FILE = path.join(process.cwd(), '.env');
const CONFIG_ENV_FILE = path.join(process.cwd(), 'config_env.json');

const keysToSync = [
  "PREFIXE",
  "NOM_OWNER",
  "NUMERO_OWNER",
  "MODE",
  "SESSION_ID",
  "STICKER_PACK_NAME",
  "STICKER_AUTHOR_NAME",
  "DATABASE",
  "NOM_BOT"
];

function manage_env() {
    const serv_vars = {};
    keysToSync.forEach(key => {
        serv_vars[key] = process.env[key] || "";
    });

    dotenv.config({ override: true });

    if (!fs.existsSync(CONFIG_ENV_FILE)) {
        fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(serv_vars, null, 2), 'utf8');
    }

    if (!fs.existsSync(ENV_FILE)) {
        let envContent = "";
        keysToSync.forEach(key => {
            envContent += `${key}=${serv_vars[key] || ""}\n`;
        });
        fs.writeFileSync(ENV_FILE, envContent, 'utf8');
    }

    let configEnv = JSON.parse(fs.readFileSync(CONFIG_ENV_FILE, 'utf8'));

    let changed = false;
    keysToSync.forEach(key => {
        if (configEnv[key] !== serv_vars[key]) {
            changed = true;
            configEnv[key] = serv_vars[key];
            updateEnvFile(ENV_FILE, key, serv_vars[key]);
        }
    });

    if (changed) {
        fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(configEnv, null, 2), 'utf8');
    }
}

function updateEnvFile(filePath, key, value) {
    let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : "";
    const regex = new RegExp(`^${key}=.*$`, 'm');

    if (value === null) {
        if (regex.test(content)) {
            content = content.replace(regex, '').replace(/\n{2,}/g, '\n').trim() + '\n';
        }
    } else if (regex.test(content)) {
        content = content.replace(regex, `${key}=${value || ""}`);
    } else {
        if (content.length > 0 && !content.endsWith("\n")) content += "\n";
        content += `${key}=${value || ""}\n`;
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = { manage_env, updateEnvFile };
