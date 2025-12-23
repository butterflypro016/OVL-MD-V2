const fs = require('fs');
const path = require('path');
const { downloadContentFromMessage, jidDecode } = require("@whiskeysockets/baileys");
const FileType = require('file-type');
const { getJid } = require('./Message_upsert_events');

async function dl_save_media_ms(ovl, message) {
  const quoted = message.msg || message;
  const mime = quoted.mimetype || '';
  const type = quoted.mtype ? quoted.mtype.replace(/Message/gi, '') : mime.split('/')[0];
  if (!mime) throw new Error("MIME type manquant");

  const stream = await downloadContentFromMessage(quoted, type);
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const fileType = await FileType.fromBuffer(buffer);
  if (!fileType) throw new Error("Type de fichier inconnu");

  const dir = './downloads';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `media_${Date.now()}.${fileType.ext}`);
  await fs.promises.writeFile(filePath, buffer);

  setTimeout(() => {
    fs.unlink(filePath, () => {});
  }, 5 * 60 * 1000);

  return filePath;
}

const decodeJid = (jid) => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const d = jidDecode(jid) || {};
    return (d.user && d.server && `${d.user}@${d.server}`) || jid;
  }
  return jid;
};

async function recup_msg({ ovl, auteur, ms_org, temps = 30000 } = {}) {
  return new Promise(async (resolve, reject) => {
    if (auteur !== undefined && typeof auteur !== "string") return reject(new Error("L'auteur doit être une chaîne si défini."));
    if (ms_org !== undefined && typeof ms_org !== "string") return reject(new Error("Le ms_org doit être une chaîne si défini."));
    if (typeof temps !== "number") return reject(new Error("Le temps doit être un nombre."));

    const auteur_jid = auteur && ms_org ? await getJid(auteur, ms_org, ovl) : auteur;

    let timer;

    const listener = async ({ type, messages }) => {
      if (type !== "notify") return;

      for (const msg of messages) {
        const idSalon = msg.key.remoteJidAlt || msg.key.remoteJid;

        let expJid = msg.key.fromMe
          ? decodeJid(ovl.user.id)
          : (msg.key.participantAlt || msg.key.participant)
            ? await getJid(msg.key.participantAlt || msg.key.participant, idSalon, ovl)
            : idSalon;

        const match =
          (auteur_jid && ms_org && expJid == auteur_jid && idSalon == ms_org) ||
          (auteur_jid && !ms_org && expJid == auteur_jid) ||
          (!auteur_jid && ms_org && idSalon == ms_org) ||
          (!auteur_jid && !ms_org);

        if (match) {
          ovl.ev.off("messages.upsert", listener);
          if (timer) clearTimeout(timer);

          if ((msg.key.participantAlt || msg.key.participant) && !msg.key.fromMe) {
            msg.key.participant = await getJid(
              msg.key.participantAlt || msg.key.participant,
              idSalon,
              ovl
            );
          }

          msg.key.remoteJid = idSalon;
          return resolve(msg);
        }
      }
    };

    ovl.ev.on("messages.upsert", listener);

    if (temps > 0) {
      timer = setTimeout(() => {
        ovl.ev.off("messages.upsert", listener);
        reject(new Error("Timeout"));
      }, temps);
    }
  });
}

module.exports = { dl_save_media_ms, recup_msg };

