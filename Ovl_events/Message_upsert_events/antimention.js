const { Antimention, Antimention_warnings } = require("../../DataBase/antimention");

async function antimention(ovl, ms_org, ms, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message) {
  try {
    const mentionStatus = ms.message?.groupStatusMentionMessage;

    if (mentionStatus) {
      const settings = await Antimention.findOne({ where: { id: ms_org } });

      if (verif_Groupe) {
        if (settings && settings.mode === 'oui') {
          if (!verif_Admin && verif_Ovl_Admin) {
            const username = auteur_Message.split("@")[0];

            const key = {
              remoteJid: ms_org,
              fromMe: false,
              id: ms.key.id,
              participant: auteur_Message,
            };

            if (settings.type === 'supp') {
              await ovl.sendMessage(ms_org, {
                text: `@${username}, la mention du groupe est interdite.`,
                mentions: [auteur_Message],
              }, { quoted: ms });
              await ovl.sendMessage(ms_org, { delete: key });
            }

            if (settings.type === 'kick') {
              await ovl.sendMessage(ms_org, {
                text: `@${username} a été retiré pour avoir mentionné tout le groupe.`,
                mentions: [auteur_Message],
              }, { quoted: ms });
              await ovl.sendMessage(ms_org, { delete: key });
              await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
            }

            if (settings.type === 'warn') {
              let warning = await Antimention_warnings.findOne({
                where: { groupId: ms_org, userId: auteur_Message },
              });

              if (!warning) {
                await Antimention_warnings.create({
                  groupId: ms_org,
                  userId: auteur_Message,
                });
                await ovl.sendMessage(ms_org, { delete: key });
                await ovl.sendMessage(ms_org, {
                  text: `@${username}, avertissement 1/3 pour mention abusive.`,
                  mentions: [auteur_Message],
                }, { quoted: ms });
              } else {
                warning.count += 1;
                await warning.save();

                if (warning.count >= 3) {
                  await ovl.sendMessage(ms_org, {
                    text: `@${username} a été retiré après 3 avertissements.`,
                    mentions: [auteur_Message],
                  }, { quoted: ms });
                  await ovl.sendMessage(ms_org, { delete: key });
                  await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                  await warning.destroy();
                } else {
                  await ovl.sendMessage(ms_org, { delete: key });
                  await ovl.sendMessage(ms_org, {
                    text: `@${username}, avertissement ${warning.count}/3 pour mention abusive.`,
                    mentions: [auteur_Message],
                  }, { quoted: ms });
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Erreur dans le système Antimention :", error);
  }
}

module.exports = antimention;
