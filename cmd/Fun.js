const { ovlcmd } = require("../lib/ovlcmd");
const fancy = require("../lib/style");
const config = require("../set");
const fs = require('fs');
const axios = require('axios');
const { levels } = require('../DataBase/levels');
const { Ranks } = require('../DataBase/rank')
                      
ovlcmd(
    {
        nom_cmd: "fliptext",
        classe: "Fun",
        desc: "Inverse le texte fourni.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const text = arg.join(" ");
        if (!text) {
            return await ovl.sendMessage(ms_org, { text: "Veuillez fournir un texte à inverser !" }, { quoted: ms });
        }
        const flipped = text.split("").reverse().join("");
        await ovl.sendMessage(ms_org, { text: flipped }, { quoted: ms });
    }
);

ovlcmd(
    {
        nom_cmd: "readmore",
        classe: "Fun",
        desc: "Ajoute un effet 'voir plus' au texte.",
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms } = cmd_options;
        const text = arg.join(" ");
        if (!text) {
            return await ovl.sendMessage(ms_org, { text: "Veuillez fournir un texte" }, { quoted: ms });
        }
        const hiddenText = `${text.split(" ").join(" ")}${String.fromCharCode(8206).repeat(4001)}`;
        await ovl.sendMessage(ms_org, { text: hiddenText }, { quoted: ms });
    }
);

ovlcmd(
    {
        nom_cmd: "ship",
        classe: "Fun",
        desc: "Test de compatibilité entre deux personnes",
        alias: ["match"],
    },
    async (ms_org, ovl, cmd_options) => {
        const { auteur_Msg_Repondu, auteur_Message, arg, ms,  getJid } = cmd_options;
        const tag = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`);
     const tags = await getJid(tag, ms_org, ovl);
       if (!arg[0]) {
            return await ovl.sendMessage(ms_org, { text: "Mentionne une personne" }, { quoted: ms });
         }
        const randomPercentage = Math.floor(Math.random() * 101);
        let comment;
        if (randomPercentage <= 30) {
            comment = "💔 Pas vraiment compatibles... 😢";
        } else if (randomPercentage <= 70) {
            comment = "🤔 Il y a du potentiel, mais cela demande du travail !";
        } else {
            comment = "💖 Vous êtes faits l'un pour l'autre ! 🌹";

        }

        await ovl.sendMessage(ms_org, {
            text: `💘 *Ship*\n\n @${tags.split("@")[0]} & @${auteur_Message.split("@")[0]}, ${comment}.\n💖Compatibilité :*${randomPercentage}%*`,
            mentions: [tags, auteur_Message],
        }, { quoted: ms });
    }
);
 
ovlcmd(
    {
        nom_cmd: "couplepp",
        classe: "Fun",
        desc: "Envoie des photos de couple animées.",
        alias: ["cpp"],
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            const { data } = await axios.get("https://raw.githubusercontent.com/iamriz7/kopel_/main/kopel.json");
            const randomPicture = data[Math.floor(Math.random() * data.length)];
            await ovl.sendMessage(ms_org, {
                image: { url: randomPicture.female },
                caption: "❤️ *Pour Madame 💁🏻‍♀️*",
            }, { quoted: cmd_options.ms });
            await ovl.sendMessage(ms_org, {
                image: { url: randomPicture.male },
                caption: "❤️ *Pour Monsieur 💁🏻‍♂️*",
            }, { quoted: cmd_options.ms });
        } catch (error) {
            console.error("Erreur lors de la récupération des données :", error);
            await ovl.sendMessage(ms_org, {
                text: "❗ Impossible de récupérer les images. Réessaie plus tard.",
            }, { quoted: cmd_options.ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "fancy",
    classe: "Fun",
    react: "✍️",
    desc: "Applique un style fancy au texte",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre } = cmd_options;
    const prefixe = config.PREFIXE;
    if (arg.length === 0) {
      return await repondre(
        `Utilisation :\n` +
        `${prefixe}fancy <ID> <texte> — Appliquer un style au texte\n` +
        `${prefixe}fancy list [nom] — Lister les styles disponibles (optionnel : filtrer par nom)\n\n` +
        `Exemple : ${prefixe}fancy 3 Hello World\n` +
        `Exemple pour la liste : ${prefixe}fancy list ovl\n\n`
      );
    }
    if (arg[0].toLowerCase() === 'list') {
      const filterName = arg[1] || 'OVL-MD-V2';
      return await repondre(fancy.list(filterName, fancy));
    }
    const id = parseInt(arg[0], 10);
    const text = arg.slice(1).join(" ");
    if (isNaN(id) || !text) {
      return await repondre(
        `❌ Arguments invalides.\n` +
        `Utilisation : ${prefixe}fancy <ID> <texte>\n` +
        `Pour voir la liste des styles : ${prefixe}fancy list`
      );
    }
    try {
      const keys = Object.keys(fancy).filter(k => k.length < 3);
      const styleKey = keys[id - 1];
      if (!styleKey) return await repondre(`_Style introuvable pour l'ID : ${id}_`);
      const selectedStyle = fancy[styleKey];
      return await repondre(fancy.apply(selectedStyle, text));
    } catch {
      return await repondre("_Une erreur s'est produite :(_");
    }
  }
);

ovlcmd(
    {
        nom_cmd: "blague",
        classe: "Fun",
        react: "😂",
        desc: "Renvoie une blague"
    },
    async (ms_org, ovl, cmd_options) => {
        try {
            let apiUrl = `https://v2.jokeapi.dev/joke/Any?lang=fr`;
            let response = await axios.get(apiUrl);
            let data = response.data;

            if (data.type === 'single') {
                ovl.sendMessage(ms_org, { text: `*Blague du jour :* ${data.joke}` }, { quoted: cmd_options.ms });
            } else if (data.type === 'twopart') {
                ovl.sendMessage(ms_org, { text: `*Blague du jour :* ${data.setup}\n\n*Réponse :* ${data.delivery}` }, { quoted: cmd_options.ms });
            } else {
                ovl.sendMessage(ms_org, { text: "Désolé, je n'ai pas trouvé de blague à vous raconter." }, { quoted: cmd_options.ms });
            }
        } catch (error) {
            ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération de la blague." }, { quoted: cmd_options.ms });
        }
    }
);

ovlcmd(
  {
    nom_cmd: "citation",
    classe: "Fun",
    react: "💬",
    desc: "Renvoie une citation",
  },
  async (ms_org, ovl) => {
    try {
      const apiUrl = "https://kaamelott.chaudie.re/api/random";
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status === 1 && data.citation) {
        const citation = data.citation.citation;
        const auteur = data.citation.infos.auteur || "Inconnu";
        const personnage = data.citation.infos.personnage || "Personnage inconnu";
        const saison = data.citation.infos.saison || "Saison inconnue";
        const episode = data.citation.infos.episode || "Épisode inconnu";

        const message = `*Citation du jour :*\n"${citation}"\n\n*Auteur :* ${auteur}\n*Personnage :* ${personnage}\n*Saison :* ${saison}\n*Épisode :* ${episode}`;
        ovl.sendMessage(ms_org, { text: message });
      } else {
        ovl.sendMessage(ms_org, { text: "Désolé, je n'ai pas trouvé de citation à vous donner." });
      }
    } catch (error) {
      ovl.sendMessage(ms_org, { text: "Une erreur s'est produite lors de la récupération de la citation." });
    }
  }
);

ovlcmd(
    {
        nom_cmd: "rank",
        classe: "Fun",
        react: "🏆",
        desc: "Affiche le rang d'un utilisateur selon ses messages envoyés et gère l'activation/désactivation globale du level up."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, auteur_Message, getJid, auteur_Msg_Repondu, ms } = cmd_options;
         
        const userIdl = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`) || auteur_Msg_Repondu || auteur_Message;
        const userId = await getJid(userIdl, ms_org, ovl);
        let pp;
        try {
            pp = await ovl.profilePictureUrl(userId, 'image');
        } catch {
            pp = 'https://files.catbox.moe/ulwqtr.jpg';
        }
    
        const allUsers = await Ranks.findAll({
            order: [['messages', 'DESC']]
        });

        const user = await Ranks.findOne({ where: { id: userId } });
        if (!user) {
            return ovl.sendMessage(ms_org, { text: "Vous n'avez pas encore de rang. Commencez à interagir pour en obtenir un !" }, { quoted: ms });
        }

        const { name, level, exp, messages } = user;
        const nextLevelExp = levels[level] ? levels[level + 1].expRequired : "Max";
        const rankPosition = allUsers.findIndex(u => u.id === userId) + 1;
        const totalUsers = allUsers.length;
        const message = `╭───🏆 *OVL-RANK* 🏆───╮
┃ 🏷️ *Nom :* ${name || "Inconnu"}
┃ 🥇 *Classement :* ${rankPosition}/${totalUsers}
┃ 🔰 *Niveau :* ${level}
┃ 🏅 *Titre :* ${levels[level - 1]?.name || "OVL-GOD-LEVEL"} 
┃ 📊 *EXP :* ${exp}/${nextLevelExp || "Max"}
┃ ✉️ *Messages :* ${messages}
╰──────────────────╯`;

        await ovl.sendMessage(ms_org, {
            image: { url: pp },
            caption: message,
        }, { quoted: ms });
    }
);

ovlcmd(
    {
        nom_cmd: "toprank",
        classe: "Fun",
        react: "🥇",
        desc: "Voir les meilleurs utilisateurs"
    },
    async (ms_org, ovl, cmd_options) => {
        const topUsers = await Ranks.findAll({
            order: [['messages', 'DESC']],
            limit: 10
        });

        if (topUsers.length === 0) {
            return ovl.sendMessage(ms_org, { text: "Aucune donnée disponible pour le moment." }, { quoted: cmd_options.ms });
        }

        let rankMessage = `
╭──🏆 *OVL-TOP-RANK* 🏆──╮`;

        topUsers.forEach((user, index) => {
            const position = `${index + 1}`.padStart(2, " ");
            rankMessage += `┃ ${position}. 🏷️ *Nom :* ${user.name || "Inconnu"}
┃    ✉️ *Messages :* ${user.messages}
┃    🔰 *Niveau :* ${user.level} (${levels[user.level - 1]?.name || "OVL-GOD-LEVEL"})\n┃\n`;
        });
rankMessage += `╰───────────────────╯`;
        await ovl.sendMessage(ms_org, { text: rankMessage }, { quoted: cmd_options.ms });
    }
);

ovlcmd(
  {
    nom_cmd: "profile",
    classe: "Fun",
    react: "👤",
    desc: "Affiche le nom, le numéro et la bio d'un utilisateur"
  },
  async (ms_org, ovl, { msg_Repondu, ms, auteur_Message, arg, getJid, auteur_Msg_Repondu }) => {
    const userIdl = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@s.whatsapp.net`) || auteur_Msg_Repondu || auteur_Message;
    const userId = await getJid(userIdl, ms_org, ovl);

    let pp;
    try {
      pp = await ovl.profilePictureUrl(userId, 'image');
    } catch {
      pp = 'https://files.catbox.moe/ulwqtr.jpg';
    }

    const user = await Ranks.findOne({ where: { id: userId } });
    const name = user?.name || "Inconnu";
    const number = userId.split('@')[0];

    let bio = "Pas de bio";
    try {
      const statusArray = await ovl.fetchStatus(userId);
      if (statusArray.length > 0 && statusArray[0].status) {
        bio = typeof statusArray[0].status === 'string'
          ? statusArray[0].status
          : statusArray[0].status.status || "Pas de bio";
      }
    } catch {}

    const infoText = `👤 Nom: ${name}\n📱 Numéro: ${number}\n💬 Bio: ${bio}`;

    await ovl.sendMessage(ms_org, {
      image: { url: pp },
      caption: infoText
    }, { quoted: ms });
  }
);

ovlcmd(
  {
    nom_cmd: "fake",
    classe: "Fun",
    react: "📝",
    desc: "Envoie un message fake comme si un autre utilisateur l'avait envoyé"
  },
  async (ms_org, ovl, { ms, arg, getJid }) => {
    if (!arg[0] || !arg.join(" ").includes("/")) {
      return ovl.sendMessage(ms_org, { text: "❌ Usage: fake @user fake_message / bot_message" }, { quoted: ms });
    }

    const targetIdl = `${arg[0].replace("@", "")}@lid`;
    const userId = await getJid(targetIdl, ms_org, ovl);

    const fullText = arg.slice(1).join(" ");
    const [fakeMsgText, realMsgText] = fullText.split("/").map(t => t.trim());

    const fakeQuoted = {
      key: {
        fromMe: false,
        participant: userId,
        remoteJid: userId,
      },
      message: {
        extendedTextMessage: {
          text: fakeMsgText,
          contextInfo: { mentionedJid: [] },
        },
      }
    };

    await ovl.sendMessage(ms_org, { text: realMsgText }, { quoted: fakeQuoted });
  }
);
