const { Antibot, AntibotWarnings } = require("../../DataBase/antibot");

async function antibot(ovl, ms_org, ms, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message) {
    try {
        const botMsg = ms.key.id.startsWith('BAES') || ms.key.id.startsWith('BAE5') || ms.key.id.startsWith('EVO') || ms.key.id.startsWith('3EB0');

        if (botMsg) {
            const settings = await Antibot.findOne({ where: { id: ms_org } });
            if (verif_Groupe && settings && settings.mode === 'oui') {
                if (!verif_Admin && verif_Ovl_Admin) {
                    const key = {
                        remoteJid: ms_org,
                        fromMe: false,
                        id: ms.key.id,
                        participant: auteur_Message
                    };

                    const username = auteur_Message.split("@")[0];

                    switch (settings.type) {
                        case 'supp':
                            await ovl.sendMessage(ms_org, {
                                text: `@${username}, les bots ne sont pas autorisés ici.`,
                                mentions: [auteur_Message]
                            }, { quoted: ms });
                            await ovl.sendMessage(ms_org, { delete: key });
                            break;

                        case 'kick':
                            await ovl.sendMessage(ms_org, {
                                text: `@${username} a été retiré pour avoir utilisé un bot.`,
                                mentions: [auteur_Message]
                            }, { quoted: ms });
                            await ovl.sendMessage(ms_org, { delete: key });
                            await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                            break;

                        case 'warn':
                            let warning = await AntibotWarnings.findOne({
                                where: { groupId: ms_org, userId: auteur_Message }
                            });

                            if (!warning) {
                                await AntibotWarnings.create({ groupId: ms_org, userId: auteur_Message });
                                await ovl.sendMessage(ms_org, { delete: key });
                                await ovl.sendMessage(ms_org, {
                                    text: `@${username}, avertissement 1/3 pour utilisation de bot.`,
                                    mentions: [auteur_Message]
                                }, { quoted: ms });
                            } else {
                                warning.count += 1;
                                await warning.save();

                                if (warning.count >= 3) {
                                    await ovl.sendMessage(ms_org, {
                                        text: `@${username} a été retiré après 3 avertissements.`,
                                        mentions: [auteur_Message]
                                    }, { quoted: ms });
                                    await ovl.sendMessage(ms_org, { delete: key });
                                    await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                                    await warning.destroy();
                                } else {
                                    await ovl.sendMessage(ms_org, { delete: key });
                                    await ovl.sendMessage(ms_org, {
                                        text: `@${username}, avertissement ${warning.count}/3 pour utilisation de bot.`,
                                        mentions: [auteur_Message]
                                    }, { quoted: ms });
                                }
                            }
                            break;

                        default:
                            console.error(`Action inconnue : ${settings.type}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("Erreur dans le système Anti-Bot :", error);
    }
}

module.exports = antibot;
