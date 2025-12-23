const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");

ovlcmd(
    {
        nom_cmd: "gpt",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API gpt pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://ab-chatgpt4o.abrahamdw882.workers.dev/?q=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.data || "Erreur de réponse de l\'API.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur GPT :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "dalle",
        classe: "IA",
        react: "🎨",
        desc: "Génère des images avec DALLE-E."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer une description pour générer une image.");
        }

        try {
            const prompt = arg.join(" ");
            const apiUrl = `https://api-toxxic.zone.id/api/ai/ai4chat?prompt=${encodeURIComponent(prompt)}`;
            const result = await axios.get(apiUrl);

            return ovl.sendMessage(
                ms_org,
                {
                    image: { url: result.data.data },
                    caption: "```Powered By OVL-MD-V2```"
                },
                { quoted: ms }
            );

        } catch (err) {
            console.error("Erreur DALLE :", err);
            return repondre("Erreur lors de la génération de l'image. Réessayez plus tard.");
        }
    }
);


ovlcmd(
    {
        nom_cmd: "blackbox",
        classe: "IA",
        react: "🖤",
        desc: "Utilise l'API blackbox pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api-toxxic.zone.id/api/ai/blackbox?prompt=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.data || "Erreur de réponse de l\'API.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur GPT :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "copilot",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Copilot pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://eliteprotech-apis.zone.id/copilot?message=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.text || "Erreur de réponse de l\'API.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur Copilot :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "gemini",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Gemini-Pro pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, repondre, auteur_Message } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://eliteprotech-apis.zone.id/gemini?prompt=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.text || "Erreur de réponse de l\'API Gemini-Pro.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur Gemini-Pro :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "llama",
        classe: "IA",
        react: "🤖",
        desc: "Utilise l'API Llama pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.gurusensei.workers.dev/llama?prompt=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.response?.response || "Erreur de réponse de l\'API Llama.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur Llama :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);

/*ovlcmd(
    {
        nom_cmd: "bard",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Bard pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.diioffc.web.id/api/ai/bard?query=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.result?.message || "Erreur de réponse de l\'API Bard.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur Bard :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);

ovlcmd(
    {
        nom_cmd: "mixtral",
        classe: "IA",
        react: "🤖",
        desc: "Faites appel à l'API Mistral pour obtenir des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api.kenshiro.cfd/api/ai/mixtral?text=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.data?.response || "Erreur de réponse de l\'API Mixtral.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur Mixtral :", error);
            return repondre("Une erreur est survenue lors de l\'appel à l\'API.");
        }
    }
);
*/

ovlcmd(
    {
        nom_cmd: "claude",
        classe: "IA",
        react: "🖤",
        desc: "Utilise l'API Claude pour générer des réponses."
    },
    async (ms_org, ovl, cmd_options) => {
        const { arg, ms, repondre } = cmd_options;

        if (!arg.length) {
            return repondre("Veuillez entrer un prompt pour générer une réponse.");
        }

        const prompt = arg.join(" ");
        const apiUrl = `https://api-toxxic.zone.id/api/ai/claude?prompt=${encodeURIComponent(prompt)}`;

        try {
            const result = await axios.get(apiUrl);
            const responseText = result.data?.data || "Erreur de réponse de l'API.";
            return repondre(responseText);
        } catch (error) {
            console.error("Erreur Claude :", error);
            return repondre("Une erreur est survenue lors de l'appel à l'API.");
        }
    }
);
