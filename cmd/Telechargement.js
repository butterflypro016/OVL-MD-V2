const { ovlcmd } = require("../lib/ovlcmd");
const { fbdl, ttdl, igdl, twitterdl, ytdl, apkdl } = require("../lib/dl");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

ovlcmd(
  {
    nom_cmd: "song",
    classe: "Telechargement",
    react: "🎵",
    desc: "Télécharge une chanson depuis YouTube avec un terme de recherche",
    alias: ["play"],
  },
  async (ms_org, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }
    if (!finalArg.length) return repondre("Veuillez spécifier un titre ou un lien YouTube.");
    try {
      const query = finalArg.join(" ");
      const info = await ytdl(query, "audio");
      const audio = info.yts[0];
      const caption = `*AUDIO* 𝙊𝙑𝙇-𝙈𝘿\n\n🎼 *Titre* : ${audio.title}\n🕐 *Durée* : ${audio.duration}\n👁️ *Vues* : ${audio.views}\n🔗 *Lien* : ${audio.url}\n\n🔊 *Powered by OVL-MD-V2*`;
      await ovl.sendMessage(ms_org, { image: { url: audio.thumbnail }, caption }, { quoted: ms });
      const response = await axios.get(
        `https://you-tube-dl-psi.vercel.app/youtube/download?url=${encodeURIComponent(info.ytdl.download)}`,
        { responseType: "arraybuffer" }
      );
      const audioBuffer = Buffer.from(response.data);
      await ovl.sendMessage(ms_org, { audio: audioBuffer, mimetype: "audio/mpeg", caption: "```Powered by OVL-MD-V2```" }, { quoted: ms });
    } catch (e) {
      console.error(e);
      repondre("❌ Erreur lors du téléchargement de la chanson.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "video",
    classe: "Telechargement",
    react: "🎥",
    desc: "Télécharge une vidéo depuis YouTube avec un terme de recherche",
  },
  async (ms_org, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }
    if (!finalArg.length) return repondre("Veuillez spécifier un titre ou un lien YouTube.");
    try {
      const query = finalArg.join(" ");
      const info = await ytdl(query, "video");
      const video = info.yts[0];
      const caption = `*VIDÉO* 𝙊𝙑𝙇-𝙈𝘿\n\n🎼 *Titre* : ${video.title}\n🕐 *Durée* : ${video.duration}\n👁️ *Vues* : ${video.views}\n🔗 *Lien* : ${video.url}\n\n🎬 *Powered by OVL-MD-V2*`;
      await ovl.sendMessage(ms_org, { image: { url: video.thumbnail }, caption }, { quoted: ms });
      const response = await axios.get(
        `https://you-tube-dl-psi.vercel.app/youtube/download?url=${encodeURIComponent(info.ytdl.download)}`,
        { responseType: "arraybuffer" }
      );
      const videoBuffer = Buffer.from(response.data);
      await ovl.sendMessage(ms_org, { video: videoBuffer, mimetype: "video/mp4", caption: "```Powered by OVL-MD-V2```" }, { quoted: ms });
    } catch (e) {
      console.error(e);
      repondre("❌ Erreur lors du téléchargement de la vidéo.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "yta",
    classe: "Telechargement",
    react: "🎧",
    desc: "Télécharge l'audio d'une vidéo YouTube à l'aide d'un lien",
    alias: ["ytmp3"],
  },
  async (ms_org, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }

    const link = finalArg.join(" ");
    if (!link.startsWith("https://")) 
      return repondre("Exemple : *yta https://youtube.com/watch?v=xyz*");

    try {
      const info = await ytdl(link, "audio");
      const response = await axios.get(
        `https://you-tube-dl-psi.vercel.app/youtube/download?url=${encodeURIComponent(info.ytdl.download)}`,
        { responseType: "arraybuffer" }
      );
      const audioBuffer = Buffer.from(response.data);
      await ovl.sendMessage(
        ms_org,
        { audio: audioBuffer, mimetype: "audio/mpeg", caption: "```Powered by OVL-MD-V2```" },
        { quoted: ms }
      );
    } catch (e) {
      console.error(e);
      repondre("Impossible de télécharger l'audio.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "ytv",
    classe: "Telechargement",
    react: "🎬",
    desc: "Télécharge une vidéo YouTube à l'aide d'un lien",
    alias: ["ytmp4"],
  },
  async (ms_org, ovl, { arg, ms, repondre, msg_Repondu }) => {
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }

    const link = finalArg.join(" ");
    if (!link.startsWith("https://")) 
      return repondre("Exemple : *ytv https://youtube.com/watch?v=xyz*");

    try {
      const info = await ytdl(link, "video");
      const response = await axios.get(
        `https://you-tube-dl-psi.vercel.app/youtube/download?url=${encodeURIComponent(info.ytdl.download)}`,
        { responseType: "arraybuffer" }
      );
      const videoBuffer = Buffer.from(response.data);
      await ovl.sendMessage(
        ms_org,
        { video: videoBuffer, mimetype: "video/mp4", caption: "```Powered by OVL-MD-V2```" },
        { quoted: ms }
      );
    } catch (e) {
      console.error(e);
      repondre("Impossible de télécharger la vidéo.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "fbdl",
    classe: "Telechargement",
    react: "📥",
    alias: ["facebook", "facebockdl"],
    desc: "Télécharger ou envoyer directement une vidéo depuis Facebook"
  },
  async (ms_org, ovl, cmd_options) => {
    let { arg, ms, msg_Repondu } = cmd_options;
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }
    const videoLink = finalArg.join(" ");
    if (!videoLink) {
      return ovl.sendMessage(ms_org, { text: "Veuillez fournir un lien vidéo, par exemple : fbdl https://www.facebook.com/video-link" }, { quoted: ms });
    }
    try {
      const videoDownloadLink = await fbdl(videoLink);
      const response = await axios.get(videoDownloadLink, {
        responseType: "arraybuffer",
        headers: {
          "Accept": "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
      const videoBuffer = Buffer.from(response.data);
      return ovl.sendMessage(ms_org, { video: videoBuffer, caption: `\`\`\`Powered By OVL-MD-V2\`\`\`` }, { quoted: ms });
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
      console.error('Error:', error);
      return ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
    }
  }
);

async function extractLink(arg, msg_Repondu) {
  let finalArg = arg;
  if (!finalArg.length && msg_Repondu) {
    const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
    if (typeof repTexte === "string") {
      const mots = repTexte.split(/ +/);
      const lien = mots.find(mot => mot.startsWith("https"));
      if (lien) finalArg = [lien];
    }
  }
  return finalArg.join(" ");
}

ovlcmd(
  {
    nom_cmd: "tiktok",
    classe: "Telechargement",
    react: "📥",
    alias: ["ttdl", "tiktokdl", "ttvideo", "tiktokvideo"],
    desc: "Télécharger une vidéo TikTok sans filigrane"
  },
  async (ms_org, ovl, cmd_options) => {
    let { arg, ms, msg_Repondu } = cmd_options;
    const videoLink = await extractLink(arg, msg_Repondu);
    if (!videoLink) return ovl.sendMessage(ms_org, { text: "Lien TikTok requis." }, { quoted: ms });

    try {
      const links = await ttdl(videoLink);
      if (!links.noWatermark) return ovl.sendMessage(ms_org, { text: "Vidéo non disponible." }, { quoted: ms });

      const file = await axios.get(links.noWatermark, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "GoogleBot" }
      });

      await ovl.sendMessage(
        ms_org,
        { video: Buffer.from(file.data), caption: "```Powered By OVL-MD-V2```" },
        { quoted: ms }
      );
    } catch (e) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${e.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tiktokaudio",
    classe: "Telechargement",
    react: "🎵",
    alias: ["ttaudio", "ttmp3"],
    desc: "Télécharger l'audio TikTok en MP3"
  },
  async (ms_org, ovl, cmd_options) => {
    let { arg, ms, msg_Repondu } = cmd_options;
    const videoLink = await extractLink(arg, msg_Repondu);
    if (!videoLink) return ovl.sendMessage(ms_org, { text: "Lien TikTok requis." }, { quoted: ms });

    try {
      const links = await ttdl(videoLink);
      if (!links.mp3) return ovl.sendMessage(ms_org, { text: "Audio non disponible." }, { quoted: ms });

      const file = await axios.get(links.mp3, {
        responseType: "arraybuffer",
        headers: { "User-Agent": "GoogleBot" }
      });

      await ovl.sendMessage(
        ms_org,
        { audio: Buffer.from(file.data), mimetype: "audio/mp4" },
        { quoted: ms }
      );
    } catch (e) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${e.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tiktokimage",
    classe: "Telechargement",
    react: "🖼️",
    alias: ["ttimg", "ttslides"],
    desc: "Télécharger les images (slides) TikTok"
  },
  async (ms_org, ovl, cmd_options) => {
    let { arg, ms, msg_Repondu } = cmd_options;
    const videoLink = await extractLink(arg, msg_Repondu);
    if (!videoLink) return ovl.sendMessage(ms_org, { text: "Lien TikTok requis." }, { quoted: ms });

    try {
      const links = await ttdl(videoLink);
      if (!links.slides || links.slides.length === 0) {
        return ovl.sendMessage(ms_org, { text: "Aucune image trouvée." }, { quoted: ms });
      }

      for (const imgUrl of links.slides) {
        const file = await axios.get(imgUrl, {
          responseType: "arraybuffer",
          headers: { "User-Agent": "GoogleBot" }
        });

        await ovl.sendMessage(
          ms_org,
          { image: Buffer.from(file.data) },
          { quoted: ms }
        );
      }
    } catch (e) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${e.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "igdl",
    classe: "Telechargement",
    react: "📥",
    alias: ["insta", "instadl", "instagram", "instagramdl"],
    desc: "Télécharger ou envoyer directement une vidéo depuis Instagram",
  },
  async (ms_org, ovl, cmd_options) => {
    let { arg, ms, msg_Repondu } = cmd_options;
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }
    const videoLink = finalArg.join(" ");
    if (!videoLink) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez fournir un lien vidéo Instagram, par exemple : igdl https://www.instagram.com/reel/...",
      }, { quoted: ms });
    }
    try {
      const downloadLinks = await igdl(videoLink);
      const video = await axios.get(downloadLinks.result.video, {
        responseType: "arraybuffer",
        headers: {
          "Accept": "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
      return ovl.sendMessage(ms_org, {
        video: Buffer.from(video.data),
        caption: `\`\`\`Powered By OVL-MD-V2\`\`\``
      }, { quoted: ms });
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
      console.error("Error:", error);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "twitterdl",
    classe: "Telechargement",
    react: "📥",
    alias: ["twitter", "twitdl"],
    desc: "Télécharger ou envoyer directement une vidéo depuis Twitter",
  },
  async (ms_org, ovl, cmd_options) => {
    let { arg, ms, msg_Repondu } = cmd_options;
    let finalArg = arg;
    if (!finalArg.length && msg_Repondu) {
      const repTexte = msg_Repondu.conversation || msg_Repondu.extendedTextMessage?.text || "";
      if (typeof repTexte === "string") {
        const mots = repTexte.split(/ +/);
        const lien = mots.find(mot => mot.startsWith("https"));
        if (lien) finalArg = [lien];
      }
    }
    const videoLink = finalArg.join(" ");
    if (!videoLink) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez fournir un lien vidéo Twitter, par exemple : twitterdl https://twitter.com/...",
      }, { quoted: ms });
    }
    try {
      const downloadLinks = await twitterdl(videoLink);
      const video = await axios.get(downloadLinks.result.video, {
        responseType: "arraybuffer",
        headers: {
          "Accept": "application/octet-stream",
          "Content-Type": "application/octet-stream",
          "User-Agent": "GoogleBot",
        },
      });
      return ovl.sendMessage(ms_org, {
        video: Buffer.from(video.data),
        caption: `\`\`\`Powered By OVL-MD-V2\`\`\``
      }, { quoted: ms });
    } catch (error) {
      ovl.sendMessage(ms_org, { text: `Erreur: ${error.message}` }, { quoted: ms });
      console.error("Error:", error);
    }
  }
);

ovlcmd(
  {
    nom_cmd: "app",
    classe: "Telechargement",
    react: "📥",
    desc: "Télécharger une application depuis Aptoide",
  },
  async (ms_org, ovl, cmd_options) => {
    const { repondre, arg, ms } = cmd_options;

    try {
      const appName = arg.join(" ");
      if (!appName) {
        return repondre("*Entrer le nom de l'application à rechercher*");
      }

      const searchResults = await apkdl(appName, 1);

      if (searchResults.length === 0) {
        return repondre("*Application non existante, veuillez entrer un autre nom*");
      }

      const appData = searchResults[0];
      const fileSize = parseFloat(appData.size);

      if (isNaN(fileSize)) {
        return repondre("*Erreur dans la taille du fichier*");
      }

      if (fileSize > 300) {
        return repondre("Le fichier dépasse 300 Mo, impossible de le télécharger.");
      }

      const downloadLink = appData.dllink;
      const captionText =
        "『 *ᴏᴠʟ-ᴍᴅ-ᴠ𝟸 ᴀᴘᴋ-ᴅʟ* 』\n\n" +
        "*📱ɴᴏᴍ :* " + appData.name +
        "\n*🆔ɪᴅ :* " + appData.package +
        "\n*📅ᴍɪsᴇ ᴀ̀ ᴊᴏᴜʀ:* " + appData.lastup +
        "\n*📦ᴛᴀɪʟʟᴇ :* " + appData.size + " MB\n";

      const apkFileName = (appData?.name || "Downloader") + ".apk";
      const filePath = apkFileName;

      const response = await axios.get(downloadLink, { responseType: "stream" });
      const fileWriter = fs.createWriteStream(filePath);
      response.data.pipe(fileWriter);

      await new Promise((resolve, reject) => {
        fileWriter.on("finish", resolve);
        fileWriter.on("error", reject);
      });

      const documentMessage = {
        document: fs.readFileSync(filePath),
        mimetype: "application/vnd.android.package-archive",
        fileName: apkFileName,
      };

      await ovl.sendMessage(ms_org, { image: { url: appData.icon }, caption: captionText }, { quoted: ms });
      await ovl.sendMessage(ms_org, documentMessage, { quoted: ms });

      fs.unlinkSync(filePath);
    } catch (error) {
      console.error("Erreur lors du traitement de la commande apk:", error);
      repondre("*Erreur lors du traitement de la commande apk*");
    }
  }
);
