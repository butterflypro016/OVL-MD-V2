const { ovlcmd } = require("../lib/ovlcmd");
const config = require('../set');
const { updateEnvFile } = require("../lib/manage_env");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process"); 
const simpleGit = require("simple-git");

const git = simpleGit();

const ENV_FILE = path.join(process.cwd(), ".env");
const CONFIG_ENV_FILE = path.join(process.cwd(), "config_env.json");

ovlcmd({
    nom_cmd: "setvar",
    classe: "Système",
    react: "⚙️",
    desc: "Définit ou modifie une variable d'environnement. Usage: setvar KEY = value",
}, async (ms_org, ovl, { repondre, prenium_id, arg }) => {
    if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    try {
        let [key, ...valArr] = arg;
        key = key?.toUpperCase();
        if (!key || valArr.length === 0 || valArr[0] !== "=") 
            return repondre("Usage correct : setvar KEY = value\nExemple : setvar MODE = private");

        const value = valArr.slice(1).join(" ");
        updateEnvFile(ENV_FILE, key, value);

        let configEnv = fs.existsSync(CONFIG_ENV_FILE) ? JSON.parse(fs.readFileSync(CONFIG_ENV_FILE, "utf8")) : {};
        configEnv[key] = value;
        fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(configEnv, null, 2), "utf8");

        config[key] = value;

        repondre(`Variable mise à jour : ${key} = ${value}`);
    } catch (e) {
        console.error(e);
        repondre("Une erreur est survenue lors de la mise à jour de la variable.");
    }
});

ovlcmd({
    nom_cmd: "delvar",
    classe: "Système",
    react: "🗑️",
    desc: "Supprime une variable d'environnement. Usage: delvar KEY",
}, async (ms_org, ovl, { repondre, prenium_id, arg }) => {
    if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    try {
        const key = arg[0]?.toUpperCase();
        if (!key) return repondre("Usage correct : delvar KEY\nExemple : delvar MODE");

        updateEnvFile(ENV_FILE, key, null);

        let configEnv = fs.existsSync(CONFIG_ENV_FILE) ? JSON.parse(fs.readFileSync(CONFIG_ENV_FILE, "utf8")) : {};
        delete configEnv[key];
        fs.writeFileSync(CONFIG_ENV_FILE, JSON.stringify(configEnv, null, 2), "utf8");

        delete config[key];

        repondre(`Variable supprimée : ${key}`);
    } catch (e) {
        console.error(e);
        repondre("Une erreur est survenue lors de la suppression de la variable.");
    }
});

ovlcmd({
    nom_cmd: "getvar",
    classe: "Système",
    react: "📄",
    desc: "Affiche la valeur d'une variable ou toutes les variables. Usage: getvar KEY ou getvar all",
}, async (ms_org, ovl, { repondre, arg, prenium_id }) => {
    if (!prenium_id) return repondre("Vous n'avez pas le droit d'exécuter cette commande.");
    try {
        const target = arg[0]?.toUpperCase();
        if (!target) return repondre("Usage : getvar KEY ou getvar all");

        if (target === "ALL") {
            const definedVars = Object.entries(config).filter(([k, v]) => v !== undefined);
            if (definedVars.length === 0) return repondre("Aucune variable définie.");
            
            const allVars = definedVars.map(([k, v]) => `• ${k} = ${v}`).join("\n");
            return repondre("Liste des variables :\n" + allVars);
        } else {
            if (config[target] === undefined) return repondre(`La variable ${target} n'existe pas.`);
            return repondre(`${target} = ${config[target]}`);
        }
    } catch (e) {
        repondre("Une erreur est survenue lors de la récupération de la variable.");
    }
});

function formatDateGMTFr(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }) + " GMT";
}

ovlcmd(
  {
    nom_cmd: "checkupdate",
    classe: "Système",
    react: "🔍",
    desc: "Vérifie les mises à jour disponibles du bot.",
  },
  async (ms_org, ovl, { repondre, prenium_id }) => {
    try {
      if (!prenium_id) {
        return ovl.sendMessage(ms_org, { text: "Vous n'avez pas le droit d'exécuter cette commande." }, { quoted: ms });
      }
      await git.init();

      const remotes = await git.getRemotes();
      if (!remotes.some(r => r.name === "origin")) {
        await git.addRemote("origin", "https://github.com/Ainz-devs/OVL-MD-V2");
      }

      await git.fetch();

      const remoteBranch = "origin/main";
      const branches = await git.branch(["-r"]);

      if (!branches.all.includes(remoteBranch)) {
        return repondre("❌ Branche distante introuvable.");
      }

      const logs = await git.log({ from: "main", to: remoteBranch });

      if (logs.total > 0) {
        const changelog = logs.all
          .map(log => `🔹 ${log.message} — _${formatDateGMTFr(log.date)}_`)
          .join("\n");

        const message = 
`✨🚀 *MISE À JOUR DISPONIBLE !* 🚀✨

📣 *Détails des modifs :*

${changelog}

🔧 Pour appliquer la mise à jour, tape la commande :  
➡️ *${config.PREFIXE}update*`;

        return repondre(message);
      } else {
        return repondre("✅ Le bot est déjà à jour.");
      }
    } catch (e) {
      console.error(e);
      return repondre("❌ Erreur lors de la vérification des mises à jour.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "update",
    classe: "Système",
    react: "♻️",
    desc: "Met à jour le bot automatiquement.",
    alias: ["maj"]
  },
  async (ms_org, ovl, { repondre, prenium_id }) => {
    try {
      if (!prenium_id) {
        return ovl.sendMessage(
          ms_org,
          { text: "Vous n'avez pas le droit d'exécuter cette commande." },
          { quoted: ms }
        )
      }

      const remotes = await git.getRemotes()
      if (!remotes.some(r => r.name === "origin")) {
        await git.addRemote("origin", "https://github.com/Ainz-devs/OVL-MD-V2.git")
      }

      await git.fetch()
      const branches = await git.branch(["-r"])
      if (!branches.all.includes("origin/main")) {
        return repondre("❌ Branche distante introuvable.")
      }

      const status = await git.status()
      if (
        !status.behind &&
        !status.modified.length &&
        !status.created.length &&
        !status.deleted.length
      ) {
        return repondre("✅ Le bot est déjà à jour.")
      }

      await repondre("⏳ Téléchargement des dernières modifications...")
      await git.reset(["--hard"])
      await git.pull("origin", "main")

      await repondre("✅ Mise à jour réussie. Redémarrage en cours...")

      setTimeout(() => {
        process.exit(0)
      }, 1000)
    } catch (err) {
      console.error("❌ Erreur de mise à jour :", err)
      await repondre("❌ Mise à jour échouée.")
    }
  }
)
