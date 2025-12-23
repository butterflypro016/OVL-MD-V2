const { ovlcmd, cmd } = require("../lib/ovlcmd");
const config = require("../set");
const { translate } = require('@vitalets/google-translate-api');
const prefixe = config.PREFIXE;
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { WA_CONF } = require('../DataBase/wa_conf');
const { TempMail } = require("tempmail.lol");
const JavaScriptObfuscator = require('javascript-obfuscator');
const { exec } = require('child_process');
const AdmZip = require('adm-zip');
const os = require('os');
const pkg = require('../package');

function stylize(text) {
    const normal = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const small =  'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ' +
                   'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ' +
                   '0123456789';
    return text.split('').map(c => {
        const i = normal.indexOf(c);
        return i !== -1 ? small[i] : c;
    }).join('');
}

const contextInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363371282577847@newsletter',
        newsletterName: 'ᴏᴠʟ-ᴍᴅ-ᴠ𝟸',
    },
};

ovlcmd(
  {
    nom_cmd: "test",
    classe: "Outils",
    react: "🌟",
    desc: "Tester la connectivité du bot"
  },
  async (ms_org, ovl, { ms, repondre, arg }) => {

    try {
      const themePath = './lib/theme.json';
      const rawData = fs.readFileSync(themePath, 'utf8');
      const themes = JSON.parse(rawData);

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', mention: '1' }
      });

      const menu = `🌐 Bienvenue sur *OVL-MD-V2*, votre bot WhatsApp multi-device.\n🔍 Tapez *${config.PREFIXE}allmenu* pour voir toutes les commandes disponibles.\n> ©2025 OVL-MD-V2 By *AINZ*`;

      let lien;

      if (settings.mention.startsWith("[")) {
        const list = JSON.parse(settings.mention);
        lien = list[Math.floor(Math.random() * list.length)];
      } else if (settings.mention.startsWith("http://") || settings.mention.startsWith("https://")) {
        const list = JSON.parse(settings.mention);
        lien = list[Math.floor(Math.random() * list.length)];
      } else {
        const selectedTheme = themes.find(t => t.id === settings.mention);
        if (!selectedTheme) throw new Error("Thème introuvable");
        lien = selectedTheme.theme[Math.floor(Math.random() * selectedTheme.theme.length)];
      }

      if (lien.endsWith(".mp4")) {
        await ovl.sendMessage(ms_org, {
          video: { url: lien },
          caption: stylize(menu),
          gifPlayback: true
        }, { quoted: ms });
      } else {
        await ovl.sendMessage(ms_org, {
          image: { url: lien },
          caption: stylize(menu)
        }, { quoted: ms });
      }

    } catch (e) {
      console.error("Erreur dans test:", e);
      const fallback = `🌐 Bienvenue sur *OVL-MD-V2*, votre bot WhatsApp multi-device.\n🔍 Tapez *${config.PREFIXE}menu* pour voir toutes les commandes disponibles.\n> ©2025 OVL-MD-V2 By *AINZ*`;

      await ovl.sendMessage(ms_org, {
        text: stylize(fallback)
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "description",
    classe: "Outils",
    desc: "Menu des commandes : toutes, par catégorie ou détail d’une commande.",
    alias: ["desc", "help"],
  },
  async (ms_org, ovl, cmd_options) => {
    try {
      const { arg, ms } = cmd_options;
      const commandes = cmd;

      if (arg.length) {
        const recherche = arg[0].toLowerCase();

        if (recherche === "all") {
          let message = "📚 *Toutes les commandes disponibles :*\n\n";
          commandes.forEach((c) => {
            message += `🔹 *${c.nom_cmd}* — _${c.desc}_\nAlias : [${c.alias.join(", ")}]\nClasse : ${c.classe}\n\n`;
          });
          return await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
        }

        if (recherche === "cat") {
          const classes = [...new Set(commandes.map(c => c.classe))];
          let message = "📂 *Catégories disponibles :*\n\n";
          classes.forEach((classe) => {
            const cmds = commandes.filter(c => c.classe === classe);
            message += `📁 *${classe}* (${cmds.length})\n`;
            cmds.forEach((c) => {
              message += ` ┗ 🧩 *${c.nom_cmd}* — _${c.desc}_\n`;
            });
            message += "\n";
          });
          return await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
        }

        if (recherche.startsWith("cat=")) {
          const classeDemandee = recherche.split("cat=")[1].toLowerCase();
          const classesExistantes = [...new Set(commandes.map(c => c.classe.toLowerCase()))];

          if (!classesExistantes.includes(classeDemandee)) {
            return await ovl.sendMessage(ms_org, {
              text: `❌ Catégorie *"${classeDemandee}"* introuvable.\nUtilise *desc cat* pour voir les catégories disponibles.`,
            }, { quoted: ms });
          }

          const commandesClasse = commandes.filter(c => c.classe.toLowerCase() === classeDemandee);
          let message = `📁 *Commandes de la catégorie "${classeDemandee}"* (${commandesClasse.length}) :\n\n`;

          commandesClasse.forEach(c => {
            message += `🧩 *${c.nom_cmd}* — _${c.desc}_\nAlias : [${c.alias.join(", ")}]\n\n`;
          });

          return await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
        }

        const commandeTrouvee = commandes.find(
          (c) =>
            c.nom_cmd.toLowerCase() === recherche ||
            c.alias.map(a => a.toLowerCase()).includes(recherche)
        );

        if (commandeTrouvee) {
          const detail = `🧩 *Détails de la commande :*\n\n` +
            `🔹 *Nom* : ${commandeTrouvee.nom_cmd}\n` +
            `📚 *Alias* : [${commandeTrouvee.alias.join(", ")}]\n` +
            `🗂️ *Classe* : ${commandeTrouvee.classe}\n` +
            `📝 *Description* : ${commandeTrouvee.desc}`;
          return await ovl.sendMessage(ms_org, { text: detail }, { quoted: ms });
        } else {
          return await ovl.sendMessage(ms_org, {
            text: `❌ Commande ou alias *"${recherche}"* introuvable.`,
          }, { quoted: ms });
        }
      }

      const menu = `📖 *Menu d'aide des commandes :*\n\n` +
        `📌 *desc all* → Toutes les commandes\n` +
        `📌 *desc cat=[catégorie]* → Commandes d’une seule catégorie\n` +
        `📌 *desc [commande]* → Détail d'une commande spécifique\n\n` +
        `Exemples :\n` +
        `• desc all\n` +
        `• desc cat=groupe\n` +
        `• desc tagall`;

      await ovl.sendMessage(ms_org, { text: menu }, { quoted: ms });

    } catch (error) {
      console.error("Erreur dans description :", error);
      await ovl.sendMessage(ms_org, {
        text: "❌ Une erreur s’est produite dans le menu description.",
      }, { quoted: cmd_options.ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "theme",
    classe: "Outils",
    react: "🎨",
    desc: "Gérer les thèmes disponibles"
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms, repondre, prenium_id } = cmd_options;

    try {
      if (!prenium_id) {
        return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
      }

      const themePath = './lib/theme.json';
      const rawData = fs.readFileSync(themePath, 'utf8');
      const themesData = JSON.parse(rawData);

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', mention: '1' }
      });

      const afficherAide = () => {
        const exemple = `${config.PREFIXE}theme 2`;
        const exempleUrl = `${config.PREFIXE}theme https://exemple.com/theme1.jpg;https://exemple.com/theme2.png`;
        return ovl.sendMessage(ms_org, {
          text:
            `🎨 *Utilisation de la commande thème :*\n\n` +
            `• *${config.PREFIXE}theme list* : Affiche la liste des thèmes disponibles\n` +
            `• *${config.PREFIXE}theme <numéro>* : Applique un thème par son numéro\n` +
            `• *${config.PREFIXE}theme <url>* : Utilise une ou plusieurs images personnalisées (séparées par ; )\n\n` +
            `📌 *Exemples :*\n` +
            `- ${exemple}\n` +
            `- ${exempleUrl}`,
        }, { quoted: ms });
      };

      if (arg.length === 0) return afficherAide();
      const sousCmd = arg.join(" ").toLowerCase();

      if (sousCmd === "list") {
        let msg = "*🎨 Liste des thèmes disponibles :*\n";
        themesData.forEach((theme, i) => {
          msg += `${i + 1}. ${theme.nom}\n`;
        });
        return ovl.sendMessage(ms_org, {
          image: { url: 'https://files.catbox.moe/6xlk10.jpg' },
          caption: msg
        }, { quoted: ms });
      }

      if (sousCmd.startsWith("http://") || sousCmd.startsWith("https://")) {
        const urls = arg.join(" ").split(";").map(u => u.trim()).filter(u => u.length > 0);
        const urlRegex = /^https?:\/\/.+/i;
        for (const u of urls) {
          if (!urlRegex.test(u)) return repondre(`❌ URL invalide : ${u}`);
        }
        settings.mention = JSON.stringify(urls);
        await settings.save();
        return ovl.sendMessage(ms_org, {
          text: `✅ ${urls.length} thème(s) personnalisé(s) défini(s).`
        }, { quoted: ms });
      }

      const numero = parseInt(sousCmd, 10);
      if (isNaN(numero) || numero < 1 || numero > themesData.length) {
        return ovl.sendMessage(ms_org, {
          text: `❌ Numéro invalide.\n📌 Utilise *${config.PREFIXE}theme list* pour voir les numéros disponibles.`
        }, { quoted: ms });
      }

      const selectedTheme = themesData[numero - 1];
      const themeId = selectedTheme.id;

      settings.mention = themeId;
      await settings.save();

      return ovl.sendMessage(ms_org, {
        text: `✅ Thème *${selectedTheme.nom}* sélectionné avec succès !`
      }, { quoted: ms });

    } catch (err) {
      console.error("Erreur dans la commande theme :", err);
      return ovl.sendMessage(ms_org, {
        text: "❌ Une erreur est survenue lors du traitement de la commande."
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "menu",
    classe: "Outils",
    react: "🔅",
    desc: "Affiche le menu du bot",
  },
  async (ms_org, ovl, cmd_options) => {
    const { ms, arg } = cmd_options;

    try {
      const seconds = process.uptime();
      const j = Math.floor(seconds / 86400);
      const h = Math.floor((seconds / 3600) % 24);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      let uptime = "";
      if (j > 0) uptime += `${j}J `;
      if (h > 0) uptime += `${h}H `;
      if (m > 0) uptime += `${m}M `;
      if (s > 0) uptime += `${s}S`;

      const dateObj = new Date();
      const dateStr = dateObj.toLocaleDateString("fr-FR");
      const heureStr = dateObj.toLocaleTimeString("fr-FR");
      const platform = process.platform;

      const commandes = cmd;
      const cmd_classe = {};
      commandes.forEach(c => {
        if (!cmd_classe[c.classe]) cmd_classe[c.classe] = [];
        cmd_classe[c.classe].push(c);
      });

      const classesSorted = Object.keys(cmd_classe).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base" })
      );

      classesSorted.forEach(classe => {
        cmd_classe[classe].sort((a, b) =>
          a.nom_cmd.localeCompare(b.nom_cmd, undefined, { numeric: true })
        );
      });

      let menu = "";

      if (arg.length === 0) {
        menu += `╭──⟪ ${config.NOM_BOT} ⟫──╮
├ ߷ Préfixe       : ${config.PREFIXE}
├ ߷ Owner         : ${config.NOM_OWNER}
├ ߷ Commandes     : ${commandes.length}
├ ߷ Uptime        : ${uptime.trim()}
├ ߷ Date          : ${dateStr}
├ ߷ Heure         : ${heureStr}
├ ߷ Plateforme    : ${platform}
├ ߷ Développeur   : AINZ
├ ߷ Version       : ${pkg.version}
╰──────────────────╯\n\n`;

        menu += "╭───⟪ Catégories ⟫───╮\n";
        classesSorted.forEach((classe, i) => {
          menu += `├ ߷ ${i + 1} • ${classe}\n`;
        });
        menu += "╰───────────────────╯\n";
        menu += `
💡 Tape *${config.PREFIXE}menu <numéro>* ou *${config.PREFIXE}menu <nom>* pour voir les commandes d'une catégorie.
💡 Tape *${config.PREFIXE}allmenu* pour voir la liste de toutes les commandes disponibles.
📌 Exemples :
• *${config.PREFIXE}menu 1*
• *${config.PREFIXE}menu outils*

> ©2025 OVL-MD-V2 By *AINZ*`;
      } else if (arg[0].toLowerCase() === "allmenu") {
        menu += `╭──⟪ Toutes les commandes ⟫──╮\n`;
        commandes.forEach(c => {
          menu += `├ ߷ [${c.classe}] ${c.nom_cmd}\n`;
        });
        menu += "╰───────────────────────────╯\n";
      } else {
        const inputRaw = arg.join(" ").toLowerCase();
        let classeSelectionnee = null;

        const inputNumber = parseInt(inputRaw, 10);
        if (!isNaN(inputNumber)) {
          if (inputNumber < 1 || inputNumber > classesSorted.length) {
            return ovl.sendMessage(ms_org, { text: `Catégorie introuvable : ${arg[0]}` }, { quoted: ms });
          }
          classeSelectionnee = classesSorted[inputNumber - 1];
        } else {
          classeSelectionnee = classesSorted.find(c =>
            c.toLowerCase() === inputRaw
          );
          if (!classeSelectionnee) {
            return ovl.sendMessage(ms_org, { text: `Catégorie introuvable : ${arg.join(" ")}` }, { quoted: ms });
          }
        }

        menu += `╭────⟪ ${classeSelectionnee.toUpperCase()} ⟫────╮\n`;
        cmd_classe[classeSelectionnee].forEach(c => {
          menu += `├ ߷ ${c.nom_cmd}\n`;
        });
        menu += `╰──────────────────╯\n\nTape *${config.PREFIXE}menu* pour revenir au menu principal.`;
      }

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: "1" },
        defaults: { id: "1", mention: "1" }
      });

      const themePath = "./lib/theme.json";
      const rawData = fs.readFileSync(themePath, "utf8");
      const themes = JSON.parse(rawData);

      let lien;

      if (settings.mention.startsWith("[")) {
        const list = JSON.parse(settings.mention);
        lien = list[Math.floor(Math.random() * list.length)];
      } else if (settings.mention.startsWith("http")) {
        const list = JSON.parse(settings.mention);
        lien = list[Math.floor(Math.random() * list.length)];
      } else {
        const selectedTheme = themes.find(t => t.id === settings.mention);
        if (!selectedTheme) throw new Error();
        lien = selectedTheme.theme[Math.floor(Math.random() * selectedTheme.theme.length)];
      }

      try {
        if (lien && lien.endsWith(".mp4")) {
          await ovl.sendMessage(ms_org, {
            video: { url: lien },
            caption: stylize(menu),
            gifPlayback: true
          }, { quoted: ms });
        } else if (lien) {
          await ovl.sendMessage(ms_org, {
            image: { url: lien },
            caption: stylize(menu)
          }, { quoted: ms });
        } else {
          throw new Error();
        }
      } catch {
        await ovl.sendMessage(ms_org, {
          text: stylize(menu)
        }, { quoted: ms });
      }
    } catch {
      await ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de la génération du menu."
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "allmenu",
    classe: "Outils",
    react: "📜",
    desc: "Affiche toutes les commandes du bot",
  },
  async (ms_org, ovl, cmd_options) => {
      const { ms } = cmd_options;
    try {
      const seconds = process.uptime();
      const j = Math.floor(seconds / 86400);
      const h = Math.floor((seconds / 3600) % 24);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      let uptime = "";
      if (j > 0) uptime += `${j}J `;
      if (h > 0) uptime += `${h}H `;
      if (m > 0) uptime += `${m}M `;
      if (s > 0) uptime += `${s}S`;

      const dateObj = new Date();
      const dateStr = dateObj.toLocaleDateString("fr-FR");
      const heureStr = dateObj.toLocaleTimeString("fr-FR");
      const platform = process.platform;

      const commandes = cmd;
      const cmd_classe = {};
      commandes.forEach((cmd) => {
        if (!cmd_classe[cmd.classe]) cmd_classe[cmd.classe] = [];
        cmd_classe[cmd.classe].push(cmd);
      });

      const classesSorted = Object.keys(cmd_classe).sort((a, b) => a.localeCompare(b));
      for (const classe of classesSorted) {
        cmd_classe[classe].sort((a, b) =>
          a.nom_cmd.localeCompare(b.nom_cmd, undefined, { numeric: true })
        );
      }

      let menu = `╭──⟪ ${config.NOM_BOT} ⟫──╮
├ ߷ Préfixe       : ${config.PREFIXE}
├ ߷ Owner         : ${config.NOM_OWNER}
├ ߷ Commandes  : ${commandes.length}
├ ߷ Uptime        : ${uptime.trim()}
├ ߷ Date    : ${dateStr}
├ ߷ Heure   : ${heureStr}
├ ߷ Plateforme  : ${platform}
├ ߷ Développeur : AINZ
├ ߷ Version        : ${pkg.version}
╰──────────────────╯\n\n`;

      for (const classe of classesSorted) {
        menu += `╭──⟪ ${classe.toUpperCase()} ⟫──╮\n`;
        cmd_classe[classe].forEach((cmd) => {
          menu += `├ ߷ ${cmd.nom_cmd}\n`;
        });
        menu += `╰──────────────────╯\n\n`;
      }

      menu += `> ©2025 OVL-MD-V2 By *AINZ*`;

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', mention: '1' }
      });

      const themeId = settings.mention;
      const themePath = './lib/theme.json';
      const rawData = fs.readFileSync(themePath, 'utf8');
      const themes = JSON.parse(rawData);

      let lien;

      if (settings.mention.startsWith("[")) {
        const list = JSON.parse(settings.mention);
        lien = list[Math.floor(Math.random() * list.length)];
      } else if (settings.mention.startsWith("http://") || settings.mention.startsWith("https://")) {
        const list = JSON.parse(settings.mention);
        lien = list[Math.floor(Math.random() * list.length)];
      } else {
        const selectedTheme = themes.find(t => t.id === settings.mention);
        if (!selectedTheme) throw new Error("Thème introuvable");
        lien = selectedTheme.theme[Math.floor(Math.random() * selectedTheme.theme.length)];
      }

      try {
        if (lien && lien.endsWith(".mp4")) {
          await ovl.sendMessage(ms_org, {
            video: { url: lien },
            caption: stylize(menu),
            gifPlayback: true
          }, { quoted: ms });
        } else if (lien) {
          await ovl.sendMessage(ms_org, {
            image: { url: lien },
            caption: stylize(menu)
          }, { quoted: ms });
        } else {
          throw new Error("Aucun thème trouvé");
        }
      } catch (e) {
        await ovl.sendMessage(ms_org, {
          text: stylize(menu)
        }, { quoted: ms });
      }

    } catch (error) {
      await ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de l'affichage du menu complet."
      }, { quoted: ms });
    }
  }
);

ovlcmd(
    {
        nom_cmd: "vv",
        classe: "Outils",
        react: "👀",
        desc: "Affiche un message envoyé en vue unique dans la discussion",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms, msg_Repondu, repondre } = cmd_options;

        if (!msg_Repondu) {
            return repondre("Veuillez mentionner un message en vue unique.");
        }

        let viewOnceKey = Object.keys(msg_Repondu).find(key => key.startsWith("viewOnceMessage"));
        let vue_Unique_Message = msg_Repondu;

        if (viewOnceKey) {
            vue_Unique_Message = msg_Repondu[viewOnceKey].message;
        }

        if (vue_Unique_Message) {
            if (
                (vue_Unique_Message.imageMessage && vue_Unique_Message.imageMessage.viewOnce !== true) ||
                (vue_Unique_Message.videoMessage && vue_Unique_Message.videoMessage.viewOnce !== true) ||
                (vue_Unique_Message.audioMessage && vue_Unique_Message.audioMessage.viewOnce !== true)
            ) {
                return repondre("Ce message n'est pas un message en vue unique.");
            }
        }

        try {
            let media;
            let options = { quoted: ms };

            if (vue_Unique_Message.imageMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.imageMessage);
                await ovl.sendMessage(
                    ms_org,
                    { image: { url: media }, caption: vue_Unique_Message.imageMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.videoMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.videoMessage);
                await ovl.sendMessage(
                    ms_org,
                    { video: { url: media }, caption: vue_Unique_Message.videoMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.audioMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.audioMessage);
                await ovl.sendMessage(
                    ms_org,
                    { audio: { url: media }, mimetype: "audio/mp4", ptt: false },
                    options
                );

            } else {
                return repondre("Ce type de message en vue unique n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("❌ Erreur lors de l'envoi du message en vue unique :", _error.message || _error);
            return repondre("Une erreur est survenue lors du traitement du message.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "vv2",
        classe: "Outils",
        react: "👀",
        desc: "Affiche un message envoyé en vue unique en inbox",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms, id_Bot, msg_Repondu, repondre } = cmd_options;

        if (!msg_Repondu) {
            return repondre("Veuillez mentionner un message en vue unique.");
        }

        let viewOnceKey = Object.keys(msg_Repondu).find(key => key.startsWith("viewOnceMessage"));
        let vue_Unique_Message = msg_Repondu;

        if (viewOnceKey) {
            vue_Unique_Message = msg_Repondu[viewOnceKey].message;
        }

        if (vue_Unique_Message) {
            if (
                (vue_Unique_Message.imageMessage && vue_Unique_Message.imageMessage.viewOnce !== true) ||
                (vue_Unique_Message.videoMessage && vue_Unique_Message.videoMessage.viewOnce !== true) ||
                (vue_Unique_Message.audioMessage && vue_Unique_Message.audioMessage.viewOnce !== true)
            ) {
                return repondre("Ce message n'est pas un message en vue unique.");
            }
        }

        try {
            let media;
            let options = { quoted: ms };

            if (vue_Unique_Message.imageMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.imageMessage);
                await ovl.sendMessage(
                    id_Bot,
                    { image: { url: media }, caption: vue_Unique_Message.imageMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.videoMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.videoMessage);
                await ovl.sendMessage(
                    id_Bot,
                    { video: { url: media }, caption: vue_Unique_Message.videoMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.audioMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.audioMessage);
                await ovl.sendMessage(
                    id_Bot,
                    { audio: { url: media }, mimetype: "audio/mp4", ptt: false },
                    options
                );

            } else {
                return repondre("Ce type de message en vue unique n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("❌ Erreur lors de l'envoi du message en vue unique :", _error.message || _error);
            return repondre("Une erreur est survenue lors du traitement du message.");
        }
    }
);

ovlcmd(
  {
    nom_cmd: "ping",
    classe: "Outils",
    react: "🏓",
    desc: "Mesure la latence du bot.",
  },
  async (ms_org, ovl, cmd_options) => {
    const start = Date.now();

    const msg_envoye = await ovl.sendMessage(ms_org, {
      text: "*OVL-MD-V2 Ping...*"
    }, { quoted: cmd_options.ms });

    const end = Date.now();
    const latency = end - start;

    await ovl.sendMessage(ms_org, {
      edit: msg_envoye.key,
      text: `*🏓 Pong ! Latence : ${latency}ms*`
    });
  }
);

ovlcmd(
    {
        nom_cmd: "uptime",
        classe: "Outils",
        react: "⏱️",
        desc: "Affiche le temps de fonctionnement du bot.",
        alias: ["upt"],
    },
    async (ms_org, ovl, cmd_options) => {
        const seconds = process.uptime();
        const j = Math.floor(seconds / 86400);
        const h = Math.floor((seconds / 3600) % 24);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        let uptime = '';
        if (j > 0) uptime += `${j}J `;
        if (h > 0) uptime += `${h}H `;
        if (m > 0) uptime += `${m}M `;
        if (s > 0) uptime += `${s}S`;
        await ovl.sendMessage(ms_org, { text: `⏳ Temps de fonctionnement : ${uptime}` }, { quoted: cmd_options.ms });
    }
);

ovlcmd(
    {
        nom_cmd: "translate",
        classe: "Outils",
        react: "🌍",
        desc: "Traduit un texte dans la langue spécifiée.",
        alias: ["trt"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, msg_Repondu } = cmd_options;
        let lang, text;

        if (msg_Repondu && arg.length === 1) {
            lang = arg[0];
            text = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text;
        } else if (arg.length >= 2) {
            lang = arg[0];
            text = arg.slice(1).join(" ");
        } else {
            return await ovl.sendMessage(ms_org, { text: `Utilisation : ${prefixe}translate <langue> <texte> ou répondre à un message avec : ${prefixe}translate <langue>` }, { quoted: ms });
        }

        try {
            const result = await translate(text, { to: lang });
            await ovl.sendMessage(ms_org, { text: `🌐Traduction (${lang}) :\n${result.text}` }, { quoted: ms });
        } catch (error) {
            console.error("Erreur lors de la traduction:", error);
            await ovl.sendMessage(ms_org, { text: "Erreur lors de la traduction. Vérifiez la langue et le texte fournis." }, { quoted: ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "capture",
    classe: "Outils",
    react: "📸",
    desc: "Prend une capture d'écran d'un site web.",
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg[0]) {
      return ovl.sendMessage(ms_org, { text: `Entrez un lien` }, { quoted: ms });
    }

    const url = arg[0];

    try {
      const screenshot = await axios.get(
        `https://eliteprotech-apis.zone.id/ssweb?url=${encodeURIComponent(url)}`,
        { responseType: 'arraybuffer' }
      );

      await ovl.sendMessage(ms_org, {
        image: screenshot.data,
        caption: `Voici la capture d'écran de: ${url}`,
      }, { quoted: ms });
    } catch (error) {
      console.error('Erreur lors de la capture de l\'écran:', error.message);
      await ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de la capture du site. Veuillez réessayer plus tard.",
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "system_status",
    classe: "Outils",
    react: "🖥️",
    desc: "Affiche les informations du système en temps réel"
  },
  async (ms_org, ovl, cmd_options) => {
    const platform = os.platform();
    const arch = os.arch();
    const cpus = os.cpus();
    const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
    const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
    const hostname = os.hostname();
    const loadAverage = os.loadavg();
    const uptimeSeconds = os.uptime();

    const j = Math.floor(uptimeSeconds / 86400);
    const h = Math.floor((uptimeSeconds / 3600) % 24);
    const m = Math.floor((uptimeSeconds % 3600) / 60);
    const s = Math.floor(uptimeSeconds % 60);
    let uptime = '';
    if (j > 0) uptime += `${j}J `;
    if (h > 0) uptime += `${h}H `;
    if (m > 0) uptime += `${m}M `;
    if (s > 0) uptime += `${s}S`;

    const cpuUsage = cpus.map(cpu => {
      let total = 0;
      for (type in cpu.times) {
        total += cpu.times[type];
      }
      const usage = ((100 - (cpu.times.idle / total) * 100)).toFixed(2);
      return usage + "%";
    }).join(", ");

    const serverSpeed = (100 - loadAverage[0] * 100 / cpus.length).toFixed(2);

    await ovl.sendMessage(ms_org, {
      text: `🖥️ *ÉTAT DU SYSTÈME*\n\n` +
            `⚡ *Vitesse du serveur*: ${serverSpeed} %\n` +
            `🖧 *Charge Moyenne*: ${loadAverage.map(l => l.toFixed(2)).join(", ")}\n` +
            `⏳ *Uptime*: ${uptime.trim()}\n` +
            `💻 *Plateforme*: ${platform}\n` +
            `🔧 *Architecture*: ${arch}\n` +
            `🖧 *Processeur*: ${cpus.length} Cœur(s) (${cpuUsage})\n` +
            `💾 *Mémoire Totale*: ${totalMemory} GB\n` +
            `🆓 *Mémoire Libre*: ${freeMemory} GB\n` +
            `🌐 *Nom de l'Hôte*: ${hostname}\n` +
            `🎉 *Version*: OVL-MD ${pkg.version}`
    }, { quoted: cmd_options.ms });
  }
);


ovlcmd(
  {
    nom_cmd: "tempmail",
    classe: "Outils",
    react: "📧",
    desc: "Crée un email temporaire."
  },
  async (ms_org, ovl, cmd_options) => {
    const { ms } = cmd_options;

    try {
      const tempmail = new TempMail();
      const inbox = await tempmail.createInbox();
      
      const emailMessage = `Voici votre adresse email temporaire : ${inbox.address}\n\nVotre token est : ${inbox.token}\n\nPour récupérer vos messages, utilisez <tempinbox votre-token>.`;

      await ovl.sendMessage(ms_org, { text: emailMessage }, {quoted: ms});
      
    } catch (error) {
      console.error(error);
      return ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la création de l'email temporaire." }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tempinbox",
    classe: "Outils",
    react: "📩",
    desc: "Récupère les messages d'un email temporaire."
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, ms } = cmd_options;

    if (!arg[0]) return ovl.sendMessage(ms_org, { text: "Pour récupérer les messages de votre email temporaire, fournissez le token qui a été émis." });

    try {
      const tempmail = new TempMail();
      const emails = await tempmail.checkInbox(arg[0]);

      if (!emails || emails.length === 0) {
        return ovl.sendMessage(ms_org, { text: "Aucun message trouvé pour ce token." }, {quoted: ms});
      }

      for (let i = 0; i < emails.length; i++) {
        const email = emails[i];
        const sender = email.sender;
        const subject = email.subject;
        const date = new Date(email.date).toLocaleString();

        const messageBody = email.body;

        const mailMessage = `👥 Expéditeur : ${sender}\n📝 Sujet : ${subject}\n🕜 Date : ${date}\n📩 Message : ${messageBody}`;

        await ovl.sendMessage(ms_org, { text: mailMessage }, {quoted: ms});
      }
      
    } catch (error) {
      console.error(error);
      return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de la récupération des messages de l'email temporaire." }, {quoted: ms});
    }
  }
);

ovlcmd(
  {
    nom_cmd: "obfuscate",
    classe: "Outils",
    react: "📥",
    desc: "Obfusque du code JavaScript",
    alias: ['obf'],
  },  
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, ms } = cmd_options;
    if (!arg || arg.length === 0) return repondre("Veuillez fournir le code JavaScript à obfusquer.");
    const codeToObfuscate = arg.join(" ");
    try {
      repondre('🔄obfucation en cours...');
      const obfuscatedCode = JavaScriptObfuscator.obfuscate(codeToObfuscate, { compact: true, controlFlowFlattening: true }).getObfuscatedCode();
      const tempFilePath = path.join(__dirname, 'obfuscate.js');
      fs.writeFileSync(tempFilePath, obfuscatedCode);
      await ovl.sendMessage(ms_org, { document: { url: tempFilePath }, mimetype: 'application/javascript', fileName: 'obfuscate.js' }, { quoted: ms });
      fs.unlinkSync(tempFilePath);
    } catch (error) {
      console.error(error);
      repondre("Une erreur est survenue lors de l'obfuscation du code.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "qr",
    classe: "Outils",
    desc: "Génère un QR code pour obtenir une session_id.",
  },
  async (ms_org, ovl, { ms }) => {
    try {
      const response = await axios.get(`https://ovl-web.koyeb.app/qr`);
      const qrImageBase64 = response.data.qr;

      const filePath = path.join(__dirname, 'qr_code.png');

      fs.writeFile(filePath, qrImageBase64, 'base64', async (err) => {
        if (err) {
          await ovl.sendMessage(ms_org, {
            text: "❌ Une erreur est survenue lors de la génération du QR code."
          }, { quoted: ms });
        } else {
          const sent = await ovl.sendMessage(ms_org, {
            image: { url: filePath },
          });

          await ovl.sendMessage(ms_org, {
            text: "✅ Scannez ce QR code dans *WhatsApp > Appareils connectés > Connecter un appareil*.",
          }, { quoted: sent });
        }
      });
    } catch (error) {
      await ovl.sendMessage(ms_org, {
        text: "❌ Une erreur est survenue lors de la génération du QR code."
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "pair",
    classe: "Outils",
    desc: "Génère un pair_code pour obtenir une session_id",
  },
  async (ms_org, ovl, { arg, ms }) => {
    if (!arg.length) {
      return await ovl.sendMessage(ms_org, {
        text: "❌ Veuillez entrer un numéro de téléphone. Exemple :\n\n`pair 226XXXXXXXX`"
      }, { quoted: ms });
    }

    const number = arg.join(" ");

    try {
      const response = await axios.get(`https://ovl-web.koyeb.app/code?number=${number}`);
      const code = response.data.code || "indisponible";

      const sent = await ovl.sendMessage(ms_org, {
        text: code,
      });

      await ovl.sendMessage(ms_org, {
        text: "✅ Entrez ce code dans *WhatsApp > Appareils connectés > Connecter un appareil > Appairer avec un code*.",
      }, { quoted: sent });

    } catch (error) {
      await ovl.sendMessage(ms_org, {
        text: "❌ Une erreur est survenue lors de la génération du code."
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "gitclone",
    classe: "Outils",
    react: "📥",
    desc: "clone un repo Git",
    alias: ['gcl'],
  },  
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, ms } = cmd_options;
    if (!arg || arg.length < 1) return repondre("Veuillez fournir l'URL du dépôt Git à cloner.");
    const dp = arg[0];
    const repoUrl = dp + '.git';
    const destination = arg[1] ? arg[1] : path.basename(repoUrl, '.git');
    const tempZipPath = `${destination}.zip`;
    const gitUrlPattern = /^(https?:\/\/|git@)([\w.@:\/-]+)(\.git)(\/?)$/;
    if (!gitUrlPattern.test(repoUrl)) return repondre("URL de dépôt Git invalide.");
    try {
      repondre(`🔄Clonage du dépôt en cours...`);
      exec(`git clone ${repoUrl} ${destination}`, (error, stdout, stderr) => {
        if (error) return repondre(`Erreur lors du clonage du dépôt : ${error.message}`);
        try {
          const zip = new AdmZip();
          zip.addLocalFolder(destination);
          zip.writeZip(tempZipPath);
          const documentMessage = { document: fs.readFileSync(tempZipPath), mimetype: 'application/zip', fileName: `${destination}.zip` };
          ovl.sendMessage(ms_org, documentMessage, { quoted: ms });
          fs.rmSync(destination, { recursive: true, force: true });
          fs.unlinkSync(tempZipPath);
        } catch (zipError) {
          repondre(`Erreur lors de la compression en zip : ${zipError.message}`);
        }
      });
    } catch (error) {
      console.error(error);
      repondre("Une erreur est survenue lors du clonage du dépôt.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "owner",
    classe: "Outils",
    react: "🔅",
    desc: "Numero du propriétaire du bot",
  },  
  async (ms_org, ovl, cmd_options) => {
    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + config.NOM_OWNER + '\n' +
      'ORG:undefined;\n' +
      'TEL;type=CELL;type=VOICE;waid=' + config.NUMERO_OWNER + ':+' + config.NUMERO_OWNER + '\n' + 
      'END:VCARD';

    ovl.sendMessage(ms_org, {
      contacts: {
        displayName: config.NOM_OWNER,
        contacts: [{ vcard }],
      },
    }, { quoted: cmd_options.ms });
  }
);

ovlcmd(
  {
    nom_cmd: "developpeur",
    classe: "Outils",
    react: "🔅",
    desc: "Numero du créateur du bot",
    alias: ['dev'],
  },  
  async (ms_org, ovl, cmd_options) => {
    const devNum = '22651463203';
    const devNom = 'Ainz';

    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      'FN:' + devNom + '\n' +
      'ORG:undefined;\n' +
      'TEL;type=CELL;type=VOICE;waid=' + devNum + ':+' + devNum + '\n' + 
      'END:VCARD';

    ovl.sendMessage(ms_org, {
      contacts: {
        displayName: devNom,
        contacts: [{ vcard }],
      },
    }, { quoted: cmd_options.ms });
  }
);

ovlcmd(
  {
    nom_cmd: "support",
    classe: "Outils",
    react: "📩",
    desc: "Lien vers les groupes de support du bot",
  },
  async (ms_org, ovl, cmd_options) => {
    const { verif_Groupe, repondre, auteur_Message, ms } = cmd_options;

    const inviteLinks = [
      'https://chat.whatsapp.com/HzhikAmOuYhFXGLmcyMo62',
      'https://chat.whatsapp.com/BP1oOMh0QvR7H3vvO9bRYK'
    ];

    const message = `📩 *OVL-MD SUPPORT*\nVoici les liens pour rejoindre les groupes de support:\n\n` +
      inviteLinks.map(link => `🔗 ${link}`).join('\n\n');

    if (verif_Groupe) {
      await repondre("📩 Les liens d'invitation ont été envoyés en message privé.");
      await ovl.sendMessage(auteur_Message, { text: message }, { quoted: ms });
    } else {
      await ovl.sendMessage(ms_org, { text: message }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "repo",
    alias: ["sc", "script", "code_source", "repository"],
    classe: "Outils",
    react: "📦",
    desc: "Affiche les informations et le lien du repository du bot"
  },
  async (ms_org, ovl, { ms, repondre }) => {
    const repoUrl = "https://github.com/Ainz-devs/OVL-MD-V2";
    let caption;

    try {
      const { data } = await axios.get("https://api.github.com/repos/Ainz-devs/OVL-MD-V2");
      caption = `
╭───⟪ 📦 OVL-MD-V2 ⟫───╮
│ ⇨ ⭐ Stars       : ${data.stargazers_count}
│ ⇨ 🍴 Forks       : ${data.forks_count}
│ ⇨ 🔄 Dernière MAJ : ${new Date(data.pushed_at).toLocaleDateString("fr-FR")}
│ ⇨ 🔗 Repo        : ${data.html_url}
╰───────────────────╯
> ©2025 ᴏᴠʟ-ᴍᴅ-ᴠ2 ʙʏ *ᴀɪɴᴢ*`;
    } catch (e) {
      console.error("Erreur récupération API :", e);
      caption = `
╭───⟪ 📦 OVL-MD-V2 ⟫───╮
│ 🔗 Repo : ${repoUrl}
╰───────────────────╯
> ©2025 ᴏᴠʟ-ᴍᴅ-ᴠ2 ʙʏ *ᴀɪɴᴢ*`;
    }

    try {
      await ovl.sendMessage(ms_org, {
        image: { url: "https://files.catbox.moe/lojrxz.jpg" },
        caption,
        contextInfo
      }, { quoted: ms });
    } catch (e) {
      console.error("Erreur envoi avec image :", e);
      await ovl.sendMessage(ms_org, { text: caption, contextInfo }, { quoted: ms });
    }
  }
);
