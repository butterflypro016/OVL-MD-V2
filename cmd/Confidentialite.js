const { ovlcmd } = require("../lib/ovlcmd");
const { WA_CONF } = require('../DataBase/wa_conf');

ovlcmd(
  {
    nom_cmd: "presence",
    classe: "confidentialité",
    react: "👤",
    desc: "Active ou configure la présence sur WhatsApp",
  },
  async (jid, ovl, cmd_options) => {
    const { ms, repondre, arg, prenium_id } = cmd_options;
    try {
      if (!prenium_id) {
        return repondre("Seuls les utilisateurs prenium peuvent utiliser cette commande");
      }

      const sousCommande = arg[0]?.toLowerCase();
      const validtypes = ['off', 'enligne', 'enregistre', 'ecrit'];
      const types = {
        '1': 'enligne',
        '2': 'enregistre',
        '3': 'ecrit'
      };

      const [settings] = await WA_CONF.findOrCreate({
        where: { id: '1' },
        defaults: { id: '1', presence: 'non' },
      });

      if (sousCommande === 'off') {
        settings.presence = 'non';
        await settings.save();
        return repondre("La présence est maintenant désactivée.");
      }

      if (types[sousCommande]) {
        if (settings.presence === types[sousCommande]) {
          return repondre(`La présence est déjà configurée sur ${types[sousCommande]}`);
        }

        settings.presence = types[sousCommande];
        await settings.save();
        return repondre(`La présence est maintenant définie sur ${types[sousCommande]}`);
      }

      return repondre("Utilisation :\n" +
        "presence 1: Configurer la présence sur 'enligne'\n" +
        "presence 2: Configurer la présence sur 'enregistre'\n" +
        "presence 3: Configurer la présence sur 'ecrit'\n" +
        "presence off: Désactiver la présence");
    } catch (error) {
      console.error("Erreur lors de la configuration de presence :", error);
      repondre("Une erreur s'est produite lors de l'exécution de la commande.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "getprivacy",
    classe: "confidentialité",
    react: "📋",
    desc: "Obtenir vos paramètres de confidentialité",
  },
  async (ms_org, ovl, { repondre, prenium_id, ms }) => {
    if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");

    try {
      const { readreceipts, profile, status, online, last, groupadd, calladd } = await ovl.fetchPrivacySettings(true);
      const msg = `*♺ Mes paramètres de confidentialité*\n\n*ᝄ Nom :* ${ms.pushName}\n*ᝄ En ligne :* ${online}\n*ᝄ Profil :* ${profile}\n*ᝄ Dernière vue :* ${last}\n*ᝄ Confirmation lecture :* ${readreceipts}\n*ᝄ Statut :* ${status}\n*ᝄ Ajout groupe :* ${groupadd}\n*ᝄ Ajout appel :* ${calladd}`;
      
      let img;
      try {
        img = await ovl.profilePictureUrl(ms_org, "image");
      } catch {
        img = "https://files.catbox.moe/ulwqtr.jpg";
      }

      await ovl.sendMessage(ms_org, {image: {url: img}, caption: msg }, {quoted: ms});
    } catch (e) {
      console.error(e);
      await repondre("Erreur lors de la récupération des paramètres de confidentialité.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "setbio",
    classe: "confidentialité",
    react: "✍️",
    desc: "Modifier votre statut de profil",
  },
  async (ms_org, ovl, { repondre, prenium_id, arg }) => {
    if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");

    let text = arg.join(" ");
    if (!text) return repondre("entrez la bio\nExemple : setbio Salut!  j'utilise WhatsApp.");

    try {
      await ovl.updateProfileStatus(text);
      await repondre("Statut de profil mis à jour.");
    } catch (e) {
      console.error(e);
      await repondre("Erreur lors de la mise à jour du statut.");
    }
  }
);

const privacyValues = {
  lastseen: [
    { key: "all", desc: "Tout le monde" },
    { key: "contacts", desc: "Seulement vos contacts" },
    { key: "contact_blacklist", desc: "Tous sauf certains" },
    { key: "none", desc: "Personne" },
  ],
  online: [
    { key: "all", desc: "Visible pour tout le monde" },
    { key: "match_last_seen", desc: "Même que votre visibilité de dernière vue" },
  ],
  profile: [
    { key: "all", desc: "Tout le monde" },
    { key: "contacts", desc: "Seulement vos contacts" },
    { key: "contact_blacklist", desc: "Tous sauf certains" },
    { key: "none", desc: "Personne" },
  ],
  status: [
    { key: "all", desc: "Tout le monde" },
    { key: "contacts", desc: "Seulement vos contacts" },
    { key: "contact_blacklist", desc: "Tous sauf certains" },
    { key: "none", desc: "Personne" },
  ],
  read: [
    { key: "all", desc: "Activé (vous voyez qui a lu, et eux aussi)" },
    { key: "none", desc: "Désactivé (vous ne verrez rien, eux non plus)" },
  ],
  groupadd: [
    { key: "all", desc: "Tout le monde peut vous ajouter" },
    { key: "contacts", desc: "Seuls vos contacts peuvent vous ajouter" },
    { key: "contact_blacklist", desc: "Tous sauf certains" },
    { key: "none", desc: "Personne ne peut vous ajouter" },
  ],
};

async function handlePrivacyCommand({
  type,
  ovl,
  repondre,
  arg,
  prenium_id,
  updateFunction,
  label,
}) {
  if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");

  const values = privacyValues[type];
  let input = arg[0];

  if (!input || (!isNaN(input) && !values[Number(input) - 1])) {
    const msg = [`🔐 *Options pour ${label}* :`];
    values.forEach((v, i) => {
      msg.push(`*${i + 1}.* ${v.key} - _${v.desc}_`);
    });
    msg.push(`\n*Exemple :* ${type} 1`);
    return repondre(msg.join("\n"));
  }

  let selected;
  if (!isNaN(input)) {
    const index = Number(input) - 1;
    selected = values[index]?.key;
  } else {
    selected = values.find(v => v.key === input)?.key;
  }

  if (!selected) return repondre("Option invalide. Veuillez choisir un numéro ou une valeur valide.");

  try {
    await updateFunction(selected);
    return repondre(`✅ Confidentialité *${label}* mise à jour en *${selected}*`);
  } catch (e) {
    console.error(e);
    return repondre(`Erreur lors de la mise à jour de *${label}*`);
  }
}

ovlcmd({
  nom_cmd: "lastseen",
  classe: "confidentialité",
  react: "⏳",
  desc: "Modifier la confidentialité de la dernière vue",
}, async (ms_org, ovl, opt) => {
  await handlePrivacyCommand({
    type: "lastseen",
    ovl,
    repondre: opt.repondre,
    arg: opt.arg,
    prenium_id: opt.prenium_id,
    updateFunction: ovl.updateLastSeenPrivacy,
    label: "dernière vue",
  });
});

ovlcmd({
  nom_cmd: "online",
  classe: "confidentialité",
  react: "🟢",
  desc: "Modifier la confidentialité en ligne",
}, async (ms_org, ovl, opt) => {
  await handlePrivacyCommand({
    type: "online",
    ovl,
    repondre: opt.repondre,
    arg: opt.arg,
    prenium_id: opt.prenium_id,
    updateFunction: ovl.updateOnlinePrivacy,
    label: "en ligne",
  });
});

ovlcmd({
  nom_cmd: "mypp",
  classe: "confidentialité",
  react: "🖼️",
  desc: "Modifier la confidentialité de la photo de profil",
}, async (ms_org, ovl, opt) => {
  await handlePrivacyCommand({
    type: "profile",
    ovl,
    repondre: opt.repondre,
    arg: opt.arg,
    prenium_id: opt.prenium_id,
    updateFunction: ovl.updateProfilePicturePrivacy,
    label: "photo de profil",
  });
});

ovlcmd({
  nom_cmd: "mystatus",
  classe: "confidentialité",
  react: "📃",
  desc: "Modifier la confidentialité du statut",
}, async (ms_org, ovl, opt) => {
  await handlePrivacyCommand({
    type: "status",
    ovl,
    repondre: opt.repondre,
    arg: opt.arg,
    prenium_id: opt.prenium_id,
    updateFunction: ovl.updateStatusPrivacy,
    label: "statut",
  });
});

ovlcmd({
  nom_cmd: "read",
  classe: "confidentialité",
  react: "📖",
  desc: "Modifier la confidentialité des confirmations de lecture",
}, async (ms_org, ovl, opt) => {
  await handlePrivacyCommand({
    type: "read",
    ovl,
    repondre: opt.repondre,
    arg: opt.arg,
    prenium_id: opt.prenium_id,
    updateFunction: ovl.updateReadReceiptsPrivacy,
    label: "confirmation de lecture",
  });
});

ovlcmd({
  nom_cmd: "groupadd",
  classe: "confidentialité",
  react: "➕",
  desc: "Modifier la confidentialité d'ajout en groupe",
}, async (ms_org, ovl, opt) => {
  await handlePrivacyCommand({
    type: "groupadd",
    ovl,
    repondre: opt.repondre,
    arg: opt.arg,
    prenium_id: opt.prenium_id,
    updateFunction: ovl.updateGroupsAddPrivacy,
    label: "ajout en groupe",
  });
});
