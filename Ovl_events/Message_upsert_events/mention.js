const { getMention } = require("../../DataBase/mention");
const getJid = require("./cache_jid");

async function mention(ovl, jid, ms, mtype, verif_Groupe, id_Bot, repondre, mention_JID) {
  try {
    if (mention_JID && mention_JID.includes(id_Bot)) {
      if (verif_Groupe) {
        const data = await getMention();

        if (data && data.mode === "oui") {
          const { url, text, type } = data;

          if ((!url || url === "") && (!text || text === "")) {
            repondre("Mention activée mais aucun contenu défini.");
            return;
          }

          switch (type) {
            case "audio":
              if (!url) return repondre(text || "Aucun contenu audio défini.");
              ovl.sendMessage(jid, {
                audio: { url },
                mimetype: "audio/mpeg",
              }, { quoted: ms });
              break;

            case "image":
              if (!url) return repondre(text || "Aucun contenu image défini.");
              ovl.sendMessage(jid, {
                image: { url },
                caption: text || undefined,
              }, { quoted: ms });
              break;

            case "video":
              if (!url) return repondre(text || "Aucun contenu vidéo défini.");
              ovl.sendMessage(jid, {
                video: { url },
                caption: text || undefined,
              }, { quoted: ms });
              break;

            case "texte":
              return repondre(text || "Aucun message texte défini.");

            default:
              repondre("Le type de média est inconnu ou non pris en charge.");
          }
        }
      }
    }
  } catch (e) {
    console.error("Erreur dans mention:", e);
  }
}

module.exports = mention;
