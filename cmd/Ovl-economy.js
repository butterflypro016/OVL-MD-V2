const { ovlcmd } = require("../lib/ovlcmd");
const { modifierSolde, getInfosUtilisateur, resetEconomie, mettreAJourCapaciteBanque, ECONOMIE, TopBanque } = require("../DataBase/economie");
const crypto = require("crypto");

function generateUserId(jid) {
    const hash = crypto.createHash('md5').update(jid).digest("hex");
    return `User-${hash.slice(0, 6)}`;
}

function generateTransactionId() {
    return crypto.randomBytes(4).toString("hex").toUpperCase();
}

ovlcmd(
  {
    nom_cmd: "myecon",
    desc: "Afficher votre portefeuille et banque",
    react: "💰",
    classe: "OVL-ECON--y"
  },
  async (ms_org, ovl, { ms, getJid, arg, auteur_Message, auteur_Msg_Repondu, repondre }) => {
    try {
      const userIdl =
        (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`) ||
        auteur_Msg_Repondu ||
        auteur_Message;
      const userId = await getJid(userIdl, ms_org, ovl);
      if (!userId) return await repondre("❌ Impossible de trouver l'utilisateur.");

      let pp = 'https://wallpapercave.com/uwp/uwp4820694.jpeg';
      try {
        pp = await ovl.profilePictureUrl(userId, 'image');
      } catch {}

      const data = await getInfosUtilisateur(userId);
      if (!data) return await repondre("⚠️ Aucune information trouvée pour cet utilisateur.");

      const pseudo = data.pseudo || "Inconnu";
      const wallet = data.portefeuille ?? 0;
      const banque = data.banque ?? 0;
      const capacite = data.capacite_banque ?? 10000;
      const identifiantStable = generateUserId(userId);

      const message = `╭────🎒 *OVL-ECON--Y* 🎒────╮
┃ 👤 *Pseudo :* ${pseudo}
┃ 🆔 *Identifiant :* ${identifiantStable}
┃ 💼 *Portefeuille :* ${wallet} 💸
┃ 🏦 *Banque :* ${banque} 🪙
┃ 📈 *Capacité Banque :* ${capacite} 🧱
╰─────────────────────╯`;

      await ovl.sendMessage(
  ms_org,
  { image: { url: pp }, caption: message },
  { quoted: ms }
);
    } catch (err) {
      console.error("Erreur dans myovl_econ:", err);
      await repondre("❌ Une erreur est survenue lors de la récupération des informations économiques.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "transfer",
    desc: "Transférer de l'argent de votre banque vers la banque d'un autre utilisateur",
    react: "💸",
    classe: "OVL-ECON--y"
  },
  async (ms_org, ovl, cmd) => {
    const { ms, arg, auteur_Message, repondre, getJid } = cmd;

    if (arg.length < 2) {
      return repondre("Usage : transfer @utilisateur montant");
    }

    const destinataireIdl = arg[0].includes("@") ? `${arg[0].replace("@", "")}@lid` : null;
    const destinataireId = await getJid(destinataireIdl, ms_org, ovl);
    if (!destinataireId) {
      return repondre("Merci de mentionner un utilisateur valide (@numéro).");
    }

    if (destinataireId === auteur_Message) {
      return repondre("Vous ne pouvez pas vous transférer de l'argent à vous-même.");
    }

    const montant = parseInt(arg[1]);
    if (isNaN(montant) || montant <= 0) {
      return repondre("Le montant doit être un nombre entier positif.");
    }

    try {
      const expediteur = await getInfosUtilisateur(auteur_Message);
      const destinataire = await getInfosUtilisateur(destinataireId);

      if (!expediteur) return repondre("Profil de l'expéditeur introuvable.");
      if (!destinataire) return repondre("Profil du destinataire introuvable.");

      if (expediteur.banque < montant) {
        return repondre("Fonds insuffisants dans votre banque.");
      }

      const montantRecu = Math.floor(montant * 0.99); // 1% de frais
      if ((destinataire.banque + montantRecu) > destinataire.capacite_banque) {
        return repondre(`Ce transfert dépasserait la capacité du destinataire (${destinataire.capacite_banque} 🪙).`);
      }

      await modifierSolde(auteur_Message, "banque", -montant);
      await modifierSolde(destinataireId, "banque", montantRecu);

      const transactionId = generateTransactionId();

      const recu = `╭── 💸 *REÇU DE TRANSFERT* 💸 ──╮
┃ 🔁 *Transfert de banque à banque*
┃ 🆔 *Transaction ID :* ${transactionId}
┃ 👤 *Expéditeur :* ${expediteur.pseudo || "Inconnu"}
┃ 👥 *Destinataire :* ${destinataire.pseudo || "Inconnu"}
┃ 💰 *Montant envoyé :* ${montant} 🪙
┃ 📉 *Frais (1%) :* ${montant - montantRecu} 🪙
┃ 📥 *Montant reçu :* ${montantRecu} 🪙
┃ 📅 *Date :* ${new Date().toLocaleString()}
╰─────────────────────────╯`;

      return repondre(recu);
    } catch (error) {
      console.error("Erreur lors du transfert :", error);
      return repondre("Une erreur est survenue. Réessayez plus tard.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "resetaccount",
    classe: 'OVL-ECON--y',
    react: "♻️",
    desc: "Réinitialise le compte économie d'un utilisateur"
  },
  async (ms_org, ovl, { arg, prenium_id, getJid, auteur_Msg_Repondu }) => {
    if (!prenium_id) {
      return repondre("Vous n'avez pas l'autorisation d'exécuter cette commande.");
    }

    const cbl = (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`) || auteur_Msg_Repondu;
    const cible = await getJid(cbl, ms_org, ovl);
    if (!cible) {
      repondre("Veuillez mentionner un utilisateur ou répondre à son message.\nEx: resetaccount @user");
        
    }
    const utilisateur = await resetEconomie(cible, {
      wallet: true,
      banque: true,
      capacite: true
    });

    if (!utilisateur) {
      return repondre("Utilisateur introuvable dans la base de données.");
    }
    const identifiantStable = generateUserId(cible);
    const message = `✅ Le compte économie de l'utilisateur a bien été réinitialisé :
╭── 💼 *RESET ECONOMIE* ──╮
┃ 👤 Utilisateur : ${utilisateur.pseudo || "Inconnu"}
┃ 🆔 ID : ${identifiantStable}
┃ 💰 Portefeuille : ${utilisateur.portefeuille} 🪙
┃ 🏦 Banque : ${utilisateur.banque} 🪙
┃ 📦 Capacité : ${utilisateur.capacite_banque}
╰──────────────────────╯`;

    await repondre(message);
  }
);

const prixCapacite = {
  1: { montant: 10000, capacite: 100000 },
  2: { montant: 100000, capacite: 1000000 },
  3: { montant: 1000000, capacite: 10000000 },
  4: { montant: 10000000, capacite: 100000000 },
  5: { montant: 100000000, capacite: 1000000000 },
};

ovlcmd(
  {
    nom_cmd: "capacite",
    classe: "OVL-ECON--y",
    react: "📦",
    desc: "Augmenter la capacite de la banque"
  },
  async (ms_org, ovl, { arg, auteur_Message, repondre }) => {
    const niveau = parseInt(arg[0]);

    if (!niveau || !prixCapacite[niveau]) {
      let messageErreur = "❌ *Niveau invalide.*\n\n📦 *Niveaux disponibles (Ex: capacite 1):*\n";
      for (const [niveau, { montant, capacite }] of Object.entries(prixCapacite)) {
        messageErreur += `\n🔹 Niveau ${niveau} → 💰 ${montant} 🪙 → 📈 Capacité : ${capacite} 🪙`;
      }
      return repondre(messageErreur);
    }

    const utilisateur = await getInfosUtilisateur(auteur_Message);
    const { portefeuille } = utilisateur;

    const { montant, capacite } = prixCapacite[niveau];

    if (portefeuille < montant) {
      return repondre(`💸 Fonds insuffisants. Il faut *${montant} 🪙* dans le portefeuille.`);
    }

    await modifierSolde(auteur_Message, "portefeuille", -montant);
    await mettreAJourCapaciteBanque(auteur_Message, capacite);

    repondre(
      `✅ *Capacité améliorée au niveau ${niveau}*\n📦 *Nouvelle capacité :* ${capacite} 🪙\n💰 *Coût :* ${montant} 🪙`
    );
  }
);

ovlcmd(
  {
    nom_cmd: "depot",
    classe: "OVL-ECON--y",
    react: "🏦",
    desc: "Transférer des fonds du portefeuille vers la banque"
  },
  async (ms_org, ovl, { arg, auteur_Message, repondre }) => {
    const montant = parseInt(arg[0]);
    if (!montant || montant <= 0) {
      return repondre("Veuillez entrer un montant valide à déposer.\nEx: depot 1000");
    }

    const utilisateur = await getInfosUtilisateur(auteur_Message);
    const { portefeuille, banque, capacite_banque } = utilisateur;

    if (portefeuille < montant) {
      return repondre("Fonds insuffisants dans le portefeuille.");
    }

    if (banque + montant > capacite_banque) {
      return repondre(`Ce dépôt dépasserait la capacité de votre banque (${capacite_banque} 🪙).`);
    }

    await modifierSolde(auteur_Message, "portefeuille", -montant);
    await modifierSolde(auteur_Message, "banque", montant);

    repondre(
      `🏦 *Dépôt effectué avec succès !*
💰 *Montant déposé :* ${montant} 🪙
📦 *Banque actuelle :* ${banque + montant} / ${capacite_banque} 🪙`
    );
  }
);

ovlcmd(
  {
    nom_cmd: "retrait",
    classe: "OVL-ECON--y",
    react: "💼",
    desc: "Transférer des fonds de la banque vers le portefeuille"
  },
  async (ms_org, ovl, { arg, auteur_Message, repondre }) => {
    const montant = parseInt(arg[0]);
    if (!montant || montant <= 0) {
      return repondre("Veuillez entrer un montant valide à retirer.\nEx: retrait 1000");
    }

    const utilisateur = await getInfosUtilisateur(auteur_Message);
    const { portefeuille, banque } = utilisateur;

    if (banque < montant) {
      return repondre("Fonds insuffisants dans la banque.");
    }

    const montantFinal = Math.floor(montant * 0.99);
    const frais = montant - montantFinal;

    await modifierSolde(auteur_Message, "banque", -montant);
    await modifierSolde(auteur_Message, "portefeuille", montantFinal);
      
    repondre(
      `💼 *Retrait effectué avec succès !*
💰 *Montant demandé :* ${montant} 🪙
📉 *Frais (1%) :* ${frais} 🪙
💵 *Montant reçu :* ${montantFinal} 🪙
👛 *Portefeuille actuel :* ${portefeuille + montantFinal} 🪙`
    );
  }
);

ovlcmd(
  {
    nom_cmd: "vol",
    desc: "Tenter de voler un autre utilisateur",
    react: "🕶️",
    classe: "OVL-ECON--y"
  },
  async (ms_org, ovl, { repondre, auteur_Msg_Repondu, getJid, auteur_Message, arg, ms }) => {
     
    let victimeId = null;

    if (auteur_Msg_Repondu) {
      victimeId = auteur_Msg_Repondu;
    } else if (arg[0]?.includes("@")) {
      victimeIdl = `${arg[0].replace("@", "")}@lid`;
      victimeId = await getJid(victimeIdl, ms_org, ovl)
    }

    if (!victimeId) return repondre("Mentionne un utilisateur valide ou réponds à son message.\nEx : *vol @user* ou *vol* en réponse à un message.");

    if (victimeId === auteur_Message) return repondre("Tu ne peux pas te voler toi-même, voleur paresseux 😒.");

    const voleur = await getInfosUtilisateur(auteur_Message);
    const victime = await getInfosUtilisateur(victimeId);

    if (!voleur || !victime) return repondre("Impossible de trouver les profils des utilisateurs.");

    if (voleur.portefeuille < 1000)
      return repondre("💸 Tu dois avoir au moins 1000 🪙 pour tenter un vol (au cas où tu te fais attraper).");

    if (victime.portefeuille < 1000)
      return repondre("🤷🏽‍♂️ Ta victime est trop pauvre... Trouve-toi une meilleure cible.");

    const scenarios = ["echoue", "reussi", "attrape"];
    const resultat = scenarios[Math.floor(Math.random() * scenarios.length)];

    switch (resultat) {
      case "echoue":
        return repondre("😬 Ta victime s'est échappée ! Sois plus intimidant la prochaine fois.");

      case "reussi": {
        const montantVole = Math.floor(Math.random() * 1000) + 100;
        await modifierSolde(victimeId, "portefeuille", -montantVole);
        await modifierSolde(auteur_Message, "portefeuille", montantVole);
        return repondre(`🤑 Vol réussi ! Tu as volé *${montantVole} 🪙* à ta victime.`);
      }

      case "attrape": {
        const amende = Math.floor(Math.random() * 1000) + 100;
        await modifierSolde(auteur_Message, "portefeuille", -amende);
        return repondre(`🚓 Oups ! Tu t'es fait attraper par la police. Amende : *${amende} 🪙*.`);
      }

      default:
        return repondre("Une erreur est survenue. Essaie encore.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "pari",
    desc: "Parier de l'argent en devinant une direction",
    react: "🎲",
    classe: "OVL-ECON--y"
  },
  async (ms_org, ovl, { repondre, auteur_Message, arg, ms }) => {
    const montant = parseInt(arg[0]);
    const direction = arg[1]?.toLowerCase();

    const directionsFr = ["haut", "bas", "gauche", "droite"];

    if (!montant || montant < 50) {
      return repondre("Tu dois miser au moins 50 🪙.");
    }

    if (!direction || !directionsFr.includes(direction)) {
      return repondre("🧭 Choisis une direction valide : *haut, bas, gauche ou droite*.\nExemple : `pari 200 gauche`");
    }

    const joueur = await getInfosUtilisateur(auteur_Message);
    if (joueur.portefeuille < montant) {
      return repondre("💸 Fonds insuffisants dans ton portefeuille.");
    }

    const directionAleatoireFr = directionsFr[Math.floor(Math.random() * directionsFr.length)];
    const directionAleatoire = directionAleatoireFr;

    const imagesDirection = {
      haut: "https://files.catbox.moe/j0wmsd.jpg",
      bas: "https://files.catbox.moe/qizuxk.jpg",
      gauche: "https://files.catbox.moe/lj7xmc.jpg",
      droite: "https://files.catbox.moe/dsfbhl.jpg"
    };

    await ovl.sendMessage(ms_org, {
      image: { url: imagesDirection[directionAleatoire] },
      caption: '',
    }, { quoted: ms });

    if (direction === directionAleatoireFr) {
      const gain = montant * 2;
      await modifierSolde(auteur_Message, "portefeuille", gain);
      return repondre(`🎉 *Bravo !* La direction était *${directionAleatoireFr}*.\n✅ Tu gagnes *${gain} 🪙* !`);
    } else {
      await modifierSolde(auteur_Message, "portefeuille", -montant);
      return repondre(`😓 *Raté !* La direction correcte était *${directionAleatoireFr}*.\n❌ Tu perds *${montant} 🪙*.`);
    }
  }
);


ovlcmd(
  {
    nom_cmd: "slot",
    desc: "Jouer à la machine à sous",
    react: "🎰",
    classe: "OVL-ECON--y"
  },
  async (ms_org, ovl, { auteur_Message, repondre }) => {
    const { portefeuille } = await getInfosUtilisateur(auteur_Message);
    if (portefeuille < 100) return repondre("💰 Tu as besoin d'au moins 100 🪙 pour jouer.");

    const emojis = ["🔴", "🔵", "🟣", "🟢", "🟡", "⚪️", "⚫️"];
    const lignes = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => Math.floor(Math.random() * emojis.length))
    );

    const grille = lignes.map(l => l.map(i => emojis[i]));
    const afficher = grille.map(l => l.join("   ")).join("\n");

    const match = (a, b, c) => a === b && b === c;
    const gagne =
      match(grille[0][0], grille[0][1], grille[0][2]) ||
      match(grille[1][0], grille[1][1], grille[1][2]) ||
      match(grille[2][0], grille[2][1], grille[2][2]) ||
      match(grille[0][0], grille[1][0], grille[2][0]) ||
      match(grille[0][1], grille[1][1], grille[2][1]) ||
      match(grille[0][2], grille[1][2], grille[2][2]) ||
      match(grille[0][0], grille[1][1], grille[2][2]) ||
      match(grille[0][2], grille[1][1], grille[2][0]);

    if (gagne) {
      const gain = Math.floor(Math.random() * 5000);
      await modifierSolde(auteur_Message, "portefeuille", gain * 2);
      return repondre(`🎰 *Résultat*\n${afficher}\n\n🎉 *Jackpot ! Tu gagnes ${gain * 2} 🪙*`);
    } else {
      const perte = Math.floor(Math.random() * 300);
      await modifierSolde(auteur_Message, "portefeuille", -perte);
      return repondre(`🎰 *Résultat*\n${afficher}\n\n📉 *Tu perds ${perte} 🪙...*`);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "bonus",
    classe: "OVL-ECON--y",
    react: "🎁",
    desc: "Réclame un bonus toutes les 2 heures"
  },
  async (ms_org, ovl, { auteur_Message, repondre }) => {
    const uti = await ECONOMIE.findOne({ where: { id: auteur_Message } });
    const utilisateur = await getInfosUtilisateur(auteur_Message);
    const maintenant = Date.now();
    const deuxHeures = 2 * 60 * 60 * 1000;

    if (!utilisateur.last_bonus) {
      utilisateur.last_bonus = 0;
    }

    const tempsEcoule = maintenant - utilisateur.last_bonus;
    if (tempsEcoule < deuxHeures) {
      const tempsRestant = deuxHeures - tempsEcoule;

      const heures = Math.floor(tempsRestant / 3600000);
      const minutes = Math.floor((tempsRestant % 3600000) / 60000);
      const secondes = Math.floor((tempsRestant % 60000) / 1000);

      let message = "⏳ Tu dois attendre encore ";
      if (heures > 0) message += `${heures} h `;
      if (minutes > 0) message += `${minutes} min `;
      if (secondes > 0 || (heures === 0 && minutes === 0)) message += `${secondes} sec`;

      return repondre(message.trim() + " avant de réclamer ton prochain bonus.");
    }

    await modifierSolde(auteur_Message, "portefeuille", 1000);
    uti.last_bonus = maintenant;
    await uti.save();

    repondre("🎉 Tu as reçu *1000 pièces* ! Reviens dans 2h pour un autre bonus.");
  }
);

ovlcmd(
  {
    nom_cmd: "don",
    classe: "OVL-ECON--y",
    react: "🤝",
    desc: "Permet à un Premium de donner des pièces à un autre utilisateur"
  },
  async (ms_org, ovl, { arg, auteur_Message, getJid, auteur_Msg_Repondu, ms, repondre, prenium_id, dev_id }) => {
    const utilisateur = await getInfosUtilisateur(auteur_Message);
    if (!prenium_id) return repondre("Cette commande est réservée aux utilisateurs Premium.");

    let destinataire = null;

    if (auteur_Msg_Repondu) {
      destinataire = auteur_Msg_Repondu;
    } else if (arg[0]?.includes("@")) {
      destinatairl = `${arg[0].replace("@", "")}@lid`;
      destinataire = await getJid(destinatairl, ms_org, ovl)
    }

    if (!destinataire) {
      return repondre("Mentionne un utilisateur *ou* réponds à son message pour lui faire un don.");
    }

    const montant = parseInt(auteur_Msg_Repondu ? arg[0] : arg[1]);
    if (!montant || montant <= 0) return repondre("Montant invalide.");

    const limite = 50000;
    if (montant > limite && !dev_id) {
      return repondre(`Tu ne peux pas donner plus de *${limite} pièces*.`);
    }

    const destinataireExiste = await ECONOMIE.findOne({ where: { id: destinataire } });
    if (!destinataireExiste) {
      return repondre("L'utilisateur mentionné n'est pas enregistré dans le système.");
    }

    await modifierSolde(destinataire, "portefeuille", montant);

    await ovl.sendMessage(ms_org, {
      text: `✅ Tu as donné *${montant} pièces* à @${destinataire.split("@")[0]} 💸`,
      mentions: [destinataire],
    }, { quoted: ms });
  }
);

/*ovlcmd(
  {
    nom_cmd: "topecon",
    classe: "OVL-ECON--y",
    react: "🏦",
    desc: "Affiche les 10 utilisateurs avec la plus grande banque."
  },
  async (ms_org, ovl, { repondre }) => {
    try {
      const top = TopBanque();
      if (!top.length) {
        return repondre("Aucun utilisateur trouvé dans la base.");
      }

      let message = "🏆 *Top 10 des plus grosses Banques* 🏆\n\n";

      top.forEach((u, i) => {
        message += `*${i + 1}.* 👤 ${u.id}\n`;
        message += ` 💰 Portefeuille : ${u.portefeuille}\n`;
        message += ` 🏦 Banque      : ${u.bank}\n`;
        message += ` 📦 Capacité   : ${u.capacite}\n\n`;
      });

      await repondre(message);

    } catch (err) {
      console.error("Erreur topecon :", err);
      repondre("Une erreur est survenue lors de la récupération des données.");
    }
  }
);*/
