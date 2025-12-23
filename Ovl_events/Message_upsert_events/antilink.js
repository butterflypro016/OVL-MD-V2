const { Antilink, Antilink_warnings } = require("../../DataBase/antilink");

function containsLink(text) {
    const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
    return linkRegex.test(text);
}

async function antilink(ovl, ms_org, ms, texte, verif_Groupe, verif_Admin, verif_Ovl_Admin, auteur_Message) {
    try { 
        if (containsLink(texte)) {
            const settings = await Antilink.findOne({ where: { id: ms_org } });
            if (verif_Groupe && settings && settings.mode === 'oui') {
                if (!verif_Admin && verif_Ovl_Admin) {
                    const username = auteur_Message.split("@")[0];
                    const key = {
                        remoteJid: ms_org,
                        fromMe: false,
                        id: ms.key.id,
                        participant: auteur_Message
                    };
                    switch (settings.type) {
                        case 'supp':
                            await ovl.sendMessage(ms_org, {
                                text: `@${username}, les liens ne sont pas autorisés ici.`,
                                mentions: [auteur_Message]
                            });
                            await ovl.sendMessage(ms_org, { delete: key });
                            break;
                        case 'kick':
                            await ovl.sendMessage(ms_org, {
                                text: `@${username} a été retiré pour avoir envoyé un lien.`,
                                mentions: [auteur_Message]
                            });
                            await ovl.sendMessage(ms_org, { delete: key });
                            await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                            break;
                        case 'warn':
                            let warning = await Antilink_warnings.findOne({
                                where: { groupId: ms_org, userId: auteur_Message }
                            });
                            if (!warning) {
                                await Antilink_warnings.create({ groupId: ms_org, userId: auteur_Message });
                                await ovl.sendMessage(ms_org, { delete: key });
                                await ovl.sendMessage(ms_org, {
                                    text: `@${username}, avertissement 1/3 pour avoir envoyé un lien.`,
                                    mentions: [auteur_Message]
                                });
                            } else {
                                warning.count += 1;
                                await warning.save();
                                if (warning.count >= 3) {
                                    await ovl.sendMessage(ms_org, {
                                        text: `@${username} a été retiré après 3 avertissements.`,
                                        mentions: [auteur_Message]
                                    });
                                    await ovl.sendMessage(ms_org, { delete: key });
                                    await ovl.groupParticipantsUpdate(ms_org, [auteur_Message], "remove");
                                    await warning.destroy();
                                } else {
                                    await ovl.sendMessage(ms_org, { delete: key });
                                    await ovl.sendMessage(ms_org, {
                                        text: `@${username}, avertissement ${warning.count}/3 pour avoir envoyé un lien.`,
                                        mentions: [auteur_Message]
                                    });
                                }
                            }
                            break;
                        default:
                            console.error(`⚠️ Action inconnue : ${settings.type}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error("❌ Erreur dans le système Antilink :", error);
    }
}

module.exports = antilink;
