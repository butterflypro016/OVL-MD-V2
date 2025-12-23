const { ovlcmd } = require("../lib/ovlcmd");
const { WA_CONF } = require('../DataBase/wa_conf');
const config = require('../set');

ovlcmd(
    {
        nom_cmd: "save",
        classe: "Status",
        react: "💾",
        desc: "Télécharge un statut WhatsApp",
    },
    async (ms_org, ovl, _cmd_options) => {
        const { ms, msg_Repondu, repondre, quote, id_Bot } = _cmd_options;

        try {
            if (!msg_Repondu || !quote?.remoteJid || quote.remoteJid !== "status@broadcast") {
                return repondre("Merci de répondre à un statut WhatsApp.");
            }

            let media, options = { quoted: ms };

            if (msg_Repondu.extendedTextMessage) {
                await ovl.sendMessage(id_Bot, { text: msg_Repondu.extendedTextMessage.text }, options);
            } else if (msg_Repondu.imageMessage) {
                media = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
                await ovl.sendMessage(id_Bot, { image: { url: media }, caption: msg_Repondu.imageMessage.caption }, options);
            } else if (msg_Repondu.videoMessage) {
                media = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
                await ovl.sendMessage(id_Bot, { video: { url: media }, caption: msg_Repondu.videoMessage.caption }, options);
            } else if (msg_Repondu.audioMessage) {
                media = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
                await ovl.sendMessage(id_Bot, { audio: { url: media }, mimetype: "audio/mp4", ptt: false }, options);
            } else {
                return repondre("Ce type de statut n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("Erreur lors du téléchargement du statut :", _error);
        }
    }
);

ovlcmd(
  {
    nom_cmd: "sendme",
    classe: "Status",
    react: "📤",
    desc: "Renvoie un statut mentionné par l'utilisateur",
  },
  async (ms_org, ovl, _cmd_options) => {
    const { ms, msg_Repondu, repondre, quote } = _cmd_options;

    try {
      if (!msg_Repondu || !quote?.remoteJid || quote.remoteJid !== "status@broadcast") {
        return repondre("❌ Réponds à un statut WhatsApp pour l'envoyer ici.");
      }

      let media;
      const options = { quoted: ms };

      if (msg_Repondu.extendedTextMessage) {
        const texte = msg_Repondu.extendedTextMessage.text;
        await ovl.sendMessage(ms_org, { text: texte }, options);

      } else if (msg_Repondu.imageMessage) {
        media = await ovl.dl_save_media_ms(msg_Repondu.imageMessage);
        await ovl.sendMessage(ms_org, {
          image: { url: media },
          caption: msg_Repondu.imageMessage.caption || ""
        }, options);

      } else if (msg_Repondu.videoMessage) {
        media = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
        await ovl.sendMessage(ms_org, {
          video: { url: media },
          caption: msg_Repondu.videoMessage.caption || ""
        }, options);

      } else if (msg_Repondu.audioMessage) {
        media = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
        await ovl.sendMessage(ms_org, {
          audio: { url: media },
          mimetype: "audio/mp4",
          ptt: false
        }, options);

      } else {
        return repondre("❌ Ce type de statut n'est pas pris en charge.");
      }

    } catch (err) {
      console.error("Erreur lors du renvoi du statut :", err.message || err);
      return repondre("❌ Une erreur est survenue pendant le traitement.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "lecture_status",
    classe: "Status",
    react: "📖",
    desc: "Active ou désactive la lecture auto des status",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', lecture_status: 'non' },
      });

      if (sousCommande === 'off') {
        settings.lecture_status = 'non';
        await settings.save();
        return repondre("La lecture du statut est maintenant désactivée.");
      }

      if (sousCommande === 'on') {
        settings.lecture_status = 'oui';
        await settings.save();
        return repondre("La lecture du statut est maintenant activée.");
      }

      return repondre("Utilisation :\n" +
        "lecture_status on: Activer la lecture du statut\n" +
        "lecture_status off: Désactiver la lecture du statut");
    } catch (error) {
      console.error("Erreur lors de la configuration de lecture_status :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "dl_status",
    classe: "Status",
    react: "📥",
    desc: "Active ou désactive le téléchargement auto des status",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', dl_status: 'non' },
      });

      if (sousCommande === 'off') {
        settings.dl_status = 'non';
        await settings.save();
        return repondre("Le téléchargement du statut est maintenant désactivé.");
      }

      if (sousCommande === 'on') {
        settings.dl_status = 'oui';
        await settings.save();
        return repondre("Le téléchargement du statut est maintenant activé.");
      }

      return repondre("Utilisation :\n" +
        "dl_status on: Activer le téléchargement du statut\n" +
        "dl_status off: Désactiver le téléchargement du statut");
    } catch (error) {
      console.error("Erreur lors de la configuration de dl_status :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "likestatus",
    classe: "Status",
    react: "👍",
    desc: "Active ou désactive les likes automatiques sur les statuts",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;

    try {
      if (!prenium_id) {
        return repondre("❌ Seuls les utilisateurs *premium* peuvent utiliser cette commande.");
      }

      const sousCommande = arg[0]?.toLowerCase();

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', like_status: 'non' },
      });
        
      const afficherAide = () => {
        return repondre(
          `🔧 *Paramètres des Likes Auto sur Statuts :*\n\n` +
          `• *${config.PREFIXE}likestatus <emojie>* : Active avec <emojie>\n` +
          `• *${config.PREFIXE}likestatus off* : Désactive les likes automatiques\n\n` +
          `📌 *Exemple :* ${config.PREFIXE}likestatus 🤣\n` +
          `📊 Statut actuel : *${settings.like_status === 'non' ? 'Désactivé' : `Activé (${settings.like_status})`}*`
        );
      };

      if (!sousCommande || sousCommande === '') {
        return afficherAide();
      }

      if (sousCommande === 'off') {
        settings.like_status = 'non';
        await settings.save();
        return repondre("👍 Les likes automatiques ont été *désactivés*.");
      }
        
      const emojiRegex = /^(?:\p{Emoji}(?:\p{Emoji_Modifier}?|\uFE0F)?(?:\u200D\p{Emoji})*)$/u;
      if (!emojiRegex.test(sousCommande)) {
        return afficherAide();
      }

      settings.like_status = sousCommande;
      await settings.save();
      return repondre(`✅ Les likes automatiques sont maintenant activés avec l'emoji ${sousCommande}`);

    } catch (error) {
      console.error("❌ Erreur dans likestatus :", error);
      return repondre("❌ Une erreur s'est produite lors de la configuration.");
    }
  }
);
