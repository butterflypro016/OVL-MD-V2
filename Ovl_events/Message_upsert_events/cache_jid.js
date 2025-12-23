const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../../lib/cache_jid.json");

if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
}

function readCache() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeCache(cache) {
  fs.writeFileSync(filePath, JSON.stringify(cache, null, 2));
}

async function getJid(lid, ms_org, ovl, attempt = 0) {
  try {
    if (!lid || typeof lid !== "string") return null;
    if (lid.endsWith("@s.whatsapp.net")) return lid;

    const cache = readCache();
    if (cache[lid]) return cache[lid];

    const metadata = await ovl.groupMetadata(ms_org);
    if (!metadata || !Array.isArray(metadata.participants)) return null;

    const participant = metadata.participants.find(p => p.id == lid);
    if (!participant) return null;

    const jid = participant.phoneNumber;
    cache[lid] = jid;
    writeCache(cache);

    return jid;

  } catch (e) {
    if (attempt < 2) {
      return getJid(lid, ms_org, ovl, attempt + 1);
    }
    console.error("❌ Erreur dans getJid après 3 tentatives:", e.message);
    return null;
  }
}

module.exports = getJid;
