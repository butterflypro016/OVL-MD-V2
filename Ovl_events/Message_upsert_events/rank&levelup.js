const { levels, calculateLevel } = require('../../DataBase/levels');
const { Ranks, Levelup } = require('../../DataBase/rank');
const { changerPseudo, ajouterUtilisateur, getInfosUtilisateur } = require('../../DataBase/economie');

async function rankAndLevelUp(ovl, ms_org, texte, auteur_Message, nom_Auteur_Message) {
  if (!texte || !auteur_Message) return;

  try {
    const userId = auteur_Message;
    const infosUser = await getInfosUtilisateur(userId);
    if (!infosUser) {
      await ajouterUtilisateur(userId, nom_Auteur_Message || "ovl-user");
    }
    await changerPseudo(userId, nom_Auteur_Message || "ovl-user");
    let user = await Ranks.findOne({ where: { id: userId } });
    if (!user) {
      user = await Ranks.create({
        id: userId,
        name: nom_Auteur_Message || "ovl-user",
        level: 0,
        exp: 10,
        messages: 1,
      });
    } else {
      user.name = nom_Auteur_Message || "ovl-user";
      user.messages += 1;
      user.exp += 10;
    }

    const newLevel = calculateLevel(user.exp);

    const levelupConfig = await Levelup.findOne({ where: { id: 1 } });
    const levelUpEnabled = levelupConfig && levelupConfig.levelup === 'oui';

    if (newLevel > user.level && levelUpEnabled) {
      await ovl.sendMessage(ms_org, {
        text: `Félicitations @${(userId || '').split('@')[0]}! Vous avez atteint le niveau ${newLevel}! 🎉`,
        mentions: [userId]
      });
    }

    user.level = newLevel;
    await user.save();

  } catch (err) {
    console.error('Erreur dans rankAndLevelUp:', err);
  }
}

module.exports = rankAndLevelUp;
