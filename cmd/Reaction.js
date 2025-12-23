const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");
const fs = require("fs");
const child_process = require("child_process");

const reactions = {
    embeter: "https://api.waifu.pics/sfw/bully",
    caliner: "https://api.waifu.pics/sfw/cuddle",
    pleurer: "https://api.waifu.pics/sfw/cry",
    enlacer: "https://api.waifu.pics/sfw/hug",
    awoo: "https://api.waifu.pics/sfw/awoo",
    embrasser: "https://api.waifu.pics/sfw/kiss",
    lecher: "https://api.waifu.pics/sfw/lick",
    tapoter: "https://api.waifu.pics/sfw/pat",
    sourire_fier: "https://api.waifu.pics/sfw/smug",
    assommer: "https://api.waifu.pics/sfw/bonk",
    lancer: "https://api.waifu.pics/sfw/yeet",
    rougir: "https://api.waifu.pics/sfw/blush",
    sourire: "https://api.waifu.pics/sfw/smile",
    saluer: "https://api.waifu.pics/sfw/wave",
    highfive: "https://api.waifu.pics/sfw/highfive",
    tenir_main: "https://api.waifu.pics/sfw/handhold",
    croquer: "https://api.waifu.pics/sfw/nom",
    mordre: "https://api.waifu.pics/sfw/bite",
    sauter: "https://api.waifu.pics/sfw/glomp",
    gifler: "https://api.waifu.pics/sfw/slap",
    tuer: "https://api.waifu.pics/sfw/kill",
    coup_de_pied: "https://api.waifu.pics/sfw/kick",
    heureux: "https://api.waifu.pics/sfw/happy",
    clin_doeil: "https://api.waifu.pics/sfw/wink",
    pousser: "https://api.waifu.pics/sfw/poke",
    danser: "https://api.waifu.pics/sfw/dance",
    gene: "https://api.waifu.pics/sfw/cringe",
};

function generateCaption(nom_cmd, auteur, cible) {
    const captions = {
    embeter: {
        withTarget: `@${auteur} embête @${cible} !`,
        withoutTarget: `@${auteur} embête tout le monde !`,
    },
    caliner: {
        withTarget: `@${auteur} câline @${cible} !`,
        withoutTarget: `@${auteur} veut câliner tout le monde !`,
    },
    pleurer: {
        withTarget: `@${auteur} pleure sur l'épaule de @${cible} !`,
        withoutTarget: `@${auteur} pleure tout seul...`,
    },
    enlacer: {
        withTarget: `@${auteur} enlace chaleureusement @${cible} !`,
        withoutTarget: `@${auteur} veut enlacer tout le monde !`,
    },
    awoo: {
        withTarget: `@${auteur} fait "Awoo" à @${cible} !`,
        withoutTarget: `@${auteur} hurle "Awoo" pour tout le monde !`,
    },
    embrasser: {
        withTarget: `@${auteur} embrasse tendrement @${cible} !`,
        withoutTarget: `@${auteur} veut embrasser tout le monde !`,
    },
    lecher: {
        withTarget: `@${auteur} lèche @${cible} !`,
        withoutTarget: `@${auteur} veut lécher tout le monde !`,
    },
    tapoter: {
        withTarget: `@${auteur} tapote la tête de @${cible} !`,
        withoutTarget: `@${auteur} veut tapoter la tête de tout le monde !`,
    },
    sourire_fier: {
        withTarget: `@${auteur} adresse un sourire fier à @${cible} !`,
        withoutTarget: `@${auteur} affiche un sourire fier devant tout le monde !`,
    },
    assommer: {
        withTarget: `@${auteur} assomme @${cible} avec une massue !`,
        withoutTarget: `@${auteur} est prêt à assommer tout le monde !`,
    },
    lancer: {
        withTarget: `@${auteur} lance @${cible} loin dans les airs !`,
        withoutTarget: `@${auteur} veut lancer quelqu'un dans les airs !`,
    },
    rougir: {
        withTarget: `@${auteur} rougit en regardant @${cible} !`,
        withoutTarget: `@${auteur} rougit devant tout le monde !`,
    },
    sourire: {
        withTarget: `@${auteur} sourit joyeusement à @${cible} !`,
        withoutTarget: `@${auteur} sourit joyeusement à tout le monde !`,
    },
    saluer: {
        withTarget: `@${auteur} salue chaleureusement @${cible} !`,
        withoutTarget: `@${auteur} salue tout le monde !`,
    },
    highfive: {
        withTarget: `@${auteur} donne un high-five à @${cible} !`,
        withoutTarget: `@${auteur} veut donner un high-five à tout le monde !`,
    },
    tenir_main: {
        withTarget: `@${auteur} tient la main de @${cible} !`,
        withoutTarget: `@${auteur} veut tenir la main de tout le monde !`,
    },
    croquer: {
        withTarget: `@${auteur} croque un morceau de @${cible} !`,
        withoutTarget: `@${auteur} veut croquer tout le monde !`,
    },
    mordre: {
        withTarget: `@${auteur} mord @${cible} !`,
        withoutTarget: `@${auteur} veut mordre tout le monde !`,
    },
    sauter: {
        withTarget: `@${auteur} saute sur @${cible} avec enthousiasme !`,
        withoutTarget: `@${auteur} veut sauter sur tout le monde !`,
    },
    gifler: {
        withTarget: `@${auteur} gifle @${cible} !`,
        withoutTarget: `@${auteur} veut gifler tout le monde !`,
    },
    tuer: {
        withTarget: `@${auteur} tue @${cible} !`,
        withoutTarget: `@${auteur} est prêt à tuer tout le monde !`,
    },
    coup_de_pied: {
        withTarget: `@${auteur} donne un coup de pied à @${cible} !`,
        withoutTarget: `@${auteur} veut donner un coup de pied à tout le monde !`,
    },
    heureux: {
        withTarget: `@${auteur} est heureux en voyant @${cible} !`,
        withoutTarget: `@${auteur} est heureux avec tout le monde !`,
    },
    clin_doeil: {
        withTarget: `@${auteur} fait un clin d'œil à @${cible} !`,
        withoutTarget: `@${auteur} fait un clin d'œil à tout le monde !`,
    },
    pousser: {
        withTarget: `@${auteur} pousse doucement @${cible} !`,
        withoutTarget: `@${auteur} veut pousser tout le monde !`,
    },
    danser: {
        withTarget: `@${auteur} danse joyeusement avec @${cible} !`,
        withoutTarget: `@${auteur} danse pour tout le monde !`,
    },
    gene: {
        withTarget: `@${auteur} est gêné en regardant @${cible} !`,
        withoutTarget: `@${auteur} est gêné devant tout le monde !`,
    },
};


    return captions[nom_cmd]
        ? cible
            ? captions[nom_cmd].withTarget
            : captions[nom_cmd].withoutTarget
        : `@${auteur} a exécuté ${nom_cmd} !`;
}

async function giftovidbuff (gifbuff) {
    const tempGif = `temp_${Date.now()}.gif`;
    const tempMp4 = `temp_${Date.now()}.mp4`;

    fs.writeFileSync(tempGif, gifbuff);

    await new Promise((resolve, reject) => {
        child_process.exec(
            `ffmpeg -i ${tempGif} -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ${tempMp4}`,
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });

    const videoBuffer = fs.readFileSync(tempMp4);
    fs.unlinkSync(tempGif);
    fs.unlinkSync(tempMp4);

    return videoBuffer;
}

function addReactionCommand(nom_cmd, url) {
    ovlcmd(
        {
            nom_cmd,
            classe: "Réaction",
            react: "💬",
            desc: `Réaction de type ${nom_cmd}`,
        },
        async (ms_org, ovl, cmd_options) => {
            const { arg, auteur_Message, getJid, auteur_Msg_Repondu, repondre, ms } = cmd_options;
            const cbl = auteur_Msg_Repondu || (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`);
            const cible = await getJid(cbl, ms_org, ovl);
            try {
                const response = await axios.get(url);
                const gifUrl = response.data.url;
                const gifBuffer = (await axios.get(gifUrl, { responseType: "arraybuffer" })).data;
                const videoBuffer = await giftovidbuff(gifBuffer);
                const reactionCaption = generateCaption(nom_cmd, auteur_Message?.split('@')[0], cible?.split('@')[0]);

                await ovl.sendMessage(
                    ms_org,
                    {
                        video: videoBuffer,
                        gifPlayback: true,
                        caption: reactionCaption,
                        mentions: cible ? [auteur_Message, cible] : [auteur_Message],
                    },
                    { quoted: ms }
                );
            } catch (error) {
                console.error(`Erreur avec la commande ${nom_cmd}:`, error);
                await repondre({ text: "Désolé, une erreur est survenue lors du traitement de la commande." });
            }
        }
    );
}

// Ajout des commandes dynamiques
for (const [nom_cmd, url] of Object.entries(reactions)) {
    addReactionCommand(nom_cmd, url);
}
