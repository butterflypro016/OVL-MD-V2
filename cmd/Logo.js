const { ovlcmd } = require("../lib/ovlcmd");
const textmaker = require("../lib/textmaker");

function addTextproCommand(nom_cmd, text_pro_url, type) {
    ovlcmd(
        {
            nom_cmd: nom_cmd,
            classe: "Logo",
            react: "✨",
            desc: "Effet de texte avec Ephoto360"
        },
        async (ms_org, ovl, cmd_options) => {
            const { arg, ms } = cmd_options;
            const query = arg.join(' ');

            if (!query) {
                return await ovl.sendMessage(
                    ms_org,
                    { text: "Vous devez fournir un texte." },
                    { quoted: ms }
                );
            }

            try {
                let logo_url;

                switch (type) {
                    case 1:
                        // Type 1: Un seul mot ou texte
                        if (query.includes(';')) {
                            return await ovl.sendMessage(
                                ms_org,
                                { text: "Veuillez fournir du texte sans point-virgule (;) pour cette commande." },
                                { quoted: ms }
                            );
                        }
                        logo_url = await textmaker(text_pro_url, query);
                        break;

                    case 2:
                        // Type 2: Deux mots ou plus séparés par des point-virgules (;)
                        const textParts = query.split(';');
                        if (textParts.length < 2) {
                            return await ovl.sendMessage(
                                ms_org,
                                { text: "Veuillez fournir exactement deux textes séparés par un point-virgule (;), par exemple : Ovl;Md." },
                                { quoted: ms }
                            );
                        }
                        logo_url = await textmaker(text_pro_url, query);
                        break;

                    default:
                        throw new Error(`Type ${type} non supporté.`);
                }

                // Envoyer l'image générée
                await ovl.sendMessage(
                    ms_org,
                    {
                        image: { url: logo_url.url },
                        caption: "\`\`\`Powered By OVL-MD-V2\`\`\`"
                    },
                    { quoted: ms }
                );
            } catch (error) {
                console.error(`Erreur avec la commande ${nom_cmd}:`, error.message || error);
                await ovl.sendMessage(
                    ms_org,
                    { text: `Une erreur est survenue lors de la génération du logo : ${error.message}` },
                    { quoted: ms }
                );
            }
        }
    );
}

addTextproCommand(
    "dragonball", // Nom de la commande
    "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "deadpool", // Nom de la commande
    "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html", // URL du style
    2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "blackpink", // Nom de la commande
    "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

 addTextproCommand(
    "neon1", // Nom de la commande
    "https://en.ephoto360.com/blue-neon-text-effect-117.html", // URL du style
    1  // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "football", // Nom de la commande
    "https://en.ephoto360.com/paul-scholes-shirt-foot-ball-335.html", // URL du style
    2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "steel", // Nom de la commande
    "https://en.ephoto360.com/heated-steel-lettering-effect-65.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "paint", // Nom de la commande
    "https://en.ephoto360.com/paint-splatter-text-effect-72.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "thunder", // Nom de la commande
    "https://en.ephoto360.com/thunder-text-effect-online-97.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "thor", // Nom de la commande
    "https://en.ephoto360.com/create-thor-logo-style-text-effects-online-for-free-796.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "graffiti1", // Nom de la commande
    "https://en.ephoto360.com/cute-girl-painting-graffiti-text-effect-667.html", // URL du style
    2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "gold2", // Nom de la commande
    "https://en.ephoto360.com/modern-gold-5-215.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "neon2", // Nom de la commande
    "https://en.ephoto360.com/create-light-effects-green-neon-online-429.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "effacer", // Nom de la commande
    "https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "galaxy", // Nom de la commande
    "https://en.ephoto360.com/text-light-galaxy-effectt-345.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "vintage", // Nom de la commande
    "https://en.ephoto360.com/write-text-on-vintage-television-online-670.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "gold1", // Nom de la commande
    "https://en.ephoto360.com/gold-text-effect-158.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "graffiti2", // Nom de la commande
    "https://en.ephoto360.com/graffiti-text-5-180.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "hacker", // Nom de la commande
    "https://en.ephoto360.com/create-anonymous-hacker-avatars-cyan-neon-677.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "rain", // Nom de la commande
    "https://en.ephoto360.com/foggy-rainy-text-effect-75.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "typography", // Nom de la commande
    "https://en.ephoto360.com/create-online-typography-art-effects-with-multiple-layers-811.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "gold3", // Nom de la commande
    "https://en.ephoto360.com/glossy-chrome-text-effect-online-424.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "wood", // Nom de la commande
    "https://en.ephoto360.com/create-3d-wood-text-effects-online-free-705.html", // URL du style
    2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "captain_america", // Nom de la commande
    "https://en.ephoto360.com/create-a-cinematic-captain-america-text-effect-online-715.html", // URL du style
    2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "cubic", // Nom de la commande
    "https://en.ephoto360.com/3d-cubic-text-effect-online-88.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);


addTextproCommand(
    "green_effect", // Nom de la commande
    "https://en.ephoto360.com/create-unique-word-green-light-63.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "naruto", // Nom de la commande
    "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "sand", // Nom de la commande
    "https://en.ephoto360.com/realistic-3d-sand-text-effect-online-580.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "plasma", // Nom de la commande
    "https://en.ephoto360.com/plasma-text-effects-online-71.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "avengers", // Nom de la commande
    "https://en.ephoto360.com/create-logo-3d-style-avengers-online-427.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "underwater", // Nom de la commande
    "https://en.ephoto360.com/3d-underwater-text-effect-online-682.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "glass", // Nom de la commande
    "https://en.ephoto360.com/write-text-on-wet-glass-online-589.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "graffiti3", // Nom de la commande
    "https://en.ephoto360.com/cover-graffiti-181.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);


addTextproCommand(
    "summery", // Nom de la commande
    "https://en.ephoto360.com/create-a-summery-sand-writing-text-effect-577.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "gold4", // Nom de la commande
    "https://en.ephoto360.com/modern-gold-silver-210.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "cloud", // Nom de la commande
    "https://en.ephoto360.com/cloud-text-effect-139.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "metal", // Nom de la commande
    "https://en.ephoto360.com/metal-text-effect-online-110.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "watercolor", // Nom de la commande
    "https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html", // URL du style
     1// Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "sci_fi", // Nom de la commande
    "https://en.ephoto360.com/create-a-awesome-logo-sci-fi-effects-492.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "gold5", // Nom de la commande
    "https://en.ephoto360.com/free-glitter-text-effect-maker-online-656.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "blackpink2", // Nom de la commande
    "https://en.ephoto360.com/create-blackpink-s-born-pink-album-logo-online-779.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "cloud2", // Nom de la commande
    "https://en.ephoto360.com/create-a-cloud-text-effect-in-the-sky-618.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "neon3", // Nom de la commande
    "https://en.ephoto360.com/neon-text-effect-171.html", // URL du style
    1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "space", // Nom de la commande
    "https://en.ephoto360.com/latest-space-3d-text-effect-online-559.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "boobs", // Nom de la commande
    "https://en.ephoto360.com/music-equalizer-text-effect-259.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "blackpink3", // Nom de la commande
    "https://en.ephoto360.com/create-a-blackpink-neon-logo-text-effect-online-710.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "onepiece", // Nom de la commande
    "https://en.ephoto360.com/create-one-piece-facebook-cover-online-553.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "dragonball2", // Nom de la commande
    "https://en.ephoto360.com/free-online-dragon-ball-facebook-cover-photos-maker-443.html", // URL du style
     1// Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "football2", // Nom de la commande
    "https://en.ephoto360.com/text-on-shirt-club-real-madrid-267.html", // URL du style
     2 // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "football3", // Nom de la commande
    "https://en.ephoto360.com/create-football-shirt-messi-barca-online-268.html", // URL du style
     // Type : cette commande accepte un seul mot ou texte
);

addTextproCommand(
    "futuris", // Nom de la commande
    "https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html", // URL du style
     1 // Type : cette commande accepte un seul mot ou texte
);
