const { ovlcmd } = require("../lib/ovlcmd");
const fs = require("fs");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { execSync, exec, spawn } = require("child_process");
const path = require('path');
const config = require('../set');
const gTTS = require('gtts');
const axios = require('axios');
const FormData = require('form-data');
const { readFileSync } = require('fs');
const sharp = require('sharp');
const { Ranks } = require('../DataBase/rank');
const os = require('os');
let fusionCache = {};

async function uploadToCatbox(filePath) {
  try {
    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', fs.createReadStream(filePath));

    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    });

    return res.data;
  } catch (error) {
    console.error("Erreur lors de l'upload sur Catbox:", error);
    throw new Error("Une erreur est survenue lors de l'upload du fichier.");
  }
}



 const alea = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;
 
const isSupportedFile = (path) => {
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp", ".mp4", ".gif"];
    return validExtensions.some((ext) => path.endsWith(ext));
  };

ovlcmd(
  {
    nom_cmd: "url",
    classe: "Conversion",
    react: "📤",
    desc: "Upload un fichier (image, vidéo, audio) sur Catbox et renvoie le lien"
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

	const msg_cible = msg_Repondu || ms.message;
    if (!msg_cible) {
      return ovl.sendMessage(ms_org, { text: "Veuillez mentionner un fichier (image, vidéo, audio ou document)." }, { quoted: ms });
    }

    const mediaMessage = msg_cible.imageMessage || msg_cible.videoMessage || msg_cible.documentMessage || msg_cible.audioMessage;
    if (!mediaMessage) {
      return ovl.sendMessage(ms_org, { text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou audio." }, { quoted: ms });
    }

    try {
      const media = await ovl.dl_save_media_ms(mediaMessage);
      const link = await uploadToCatbox(media);
      await ovl.sendMessage(ms_org, { text: link }, { quoted: ms });
    } catch (error) {
      console.error("Erreur lors de l'upload sur Catbox:", error);
      await ovl.sendMessage(ms_org, { text: "Erreur lors de la création du lien Catbox." }, { quoted: ms });
    }
  }
);
  // Commande Sticker
  ovlcmd(
  {
    nom_cmd: "sticker",
    classe: "Conversion",
    react: "✍️",
    desc: "Crée un sticker à partir d'une image, vidéo ou GIF",
    alias: ["s", "stick"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, arg, ms } = cmd_options;
	  
    const msg_cible = msg_Repondu || ms.message;
    if (!msg_cible) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image, vidéo ou GIF pour créer un sticker.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_cible.imageMessage ||
        msg_cible.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image, vidéo ou GIF valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      if (!media) {
        throw new Error("Impossible de télécharger le fichier.");
      }

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: msg_cible.imageMessage ? 100 : 30
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker:", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Crop
ovlcmd(
  {
    nom_cmd: "crop",
    classe: "Conversion",
    react: "✂️",
    desc: "Crée un sticker croppé à partir d'une image ou vidéo",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    const msg_cible = msg_Repondu || ms.message;
    if (!msg_cible) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image ou vidéo.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_cible.imageMessage ||
        msg_cible.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image ou vidéo valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.CROPPED,
        quality: msg_cible.imageMessage ? 100 : 30
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker :", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Circle
ovlcmd(
  {
    nom_cmd: "circle",
    classe: "Conversion",
    react: "🔵",
    desc: "Crée un sticker circulaire à partir d'une image ou vidéo",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

	const msg_cible = msg_Repondu || ms.message;
    if (!msg_cible) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image ou vidéo.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_cible.imageMessage ||
        msg_cible.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image ou vidéo valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.CIRCLE,
        quality: msg_cible.imageMessage ? 100 : 30
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker :", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Round
ovlcmd(
  {
    nom_cmd: "round",
    classe: "Conversion",
    react: "🔲",
    desc: "Crée un sticker avec des coins arrondis à partir d'une image ou vidéo",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

	const msg_cible = msg_Repondu || ms.message;
    if (!msg_cible) {
      return ovl.sendMessage(ms_org, {
        text: "Répondez à une image ou vidéo.",
      }, { quoted: ms });
    }

    let media;
    try {
      const mediaMessage =
        msg_cible.imageMessage ||
        msg_cible.videoMessage;

      if (!mediaMessage) {
        return ovl.sendMessage(ms_org, {
          text: "Veuillez répondre à une image ou vidéo valide.",
        }, { quoted: ms });
      }

      media = await ovl.dl_save_media_ms(mediaMessage);

      const buffer = fs.readFileSync(media);

      const sticker = new Sticker(buffer, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.ROUNDED,
        quality: msg_cible.imageMessage ? 100 : 30
      });

      const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(
        ms_org,
        { sticker: fs.readFileSync(stickerFileName) },
        { quoted: ms }
      );

      fs.unlinkSync(media);
      fs.unlinkSync(stickerFileName);
    } catch (error) {
      console.error("Erreur lors de la création du sticker :", error);
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la création du sticker : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

  // Commande Take
  ovlcmd(
    {
      nom_cmd: "take",
      classe: "Conversion",
      react: "✍️",
      desc: "Modifie le nom d'un sticker",
    },
    async (ms_org, ovl, cmd_options) => {
      const { msg_Repondu, arg, nom_Auteur_Message, ms } = cmd_options;
      if (!msg_Repondu || !msg_Repondu.stickerMessage) {
        return ovl.sendMessage(ms_org, { text: "Répondez à un sticker." }, { quoted: ms });
      }
      
      try {
        const stickerBuffer = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);
        const originalQuality = msg_Repondu.stickerMessage.quality || 40;
	const sticker = new Sticker(stickerBuffer, {
          pack: arg.join(' ') ? arg.join(' '): nom_Auteur_Message,
          author: "",
          type: StickerTypes.FULL,
          quality: originalQuality,
        });

        const stickerFileName = alea(".webp");
        await sticker.toFile(stickerFileName);
        await ovl.sendMessage(
          ms_org,
          { sticker: fs.readFileSync(stickerFileName) },
          { quoted: ms }
        );
        fs.unlinkSync(stickerFileName);
      } catch (error) {
        await ovl.sendMessage(ms_org, {
          text: `Erreur lors du renommage du sticker : ${error.message}`,
        }, { quoted: ms });
      }
    }
  );

    // Commande ToImage

ovlcmd(
  {
    nom_cmd: "toimage",
    classe: "Conversion",
    react: "✍️",
    desc: "Convertit un sticker en image",
    alias: ["toimg", "photo"],
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

    if (!msg_Repondu || !msg_Repondu.stickerMessage) {
      return ovl.sendMessage(ms_org, { text: "Répondez à un sticker." }, { quoted: ms });
    }

    try {
      const stickerBuffer = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage);

      const imageBuffer = await sharp(stickerBuffer).png().toBuffer();

      await ovl.sendMessage(
        ms_org,
        { image: imageBuffer },
        { quoted: ms }
      );
    } catch (error) {
      await ovl.sendMessage(ms_org, {
        text: `Erreur lors de la conversion en image : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

// Commande Write

ovlcmd(
  {
    nom_cmd: "write",
    classe: "Conversion",
    react: "✍️",
    desc: "Ajoute du texte à une image, vidéo ou sticker",
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, arg, ms } = cmd_options;

    if (!msg_Repondu || !arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez répondre à un fichier et fournir du texte.",
      }, { quoted: ms });
    }

    const mediaMessage =
      msg_Repondu.imageMessage ||
      msg_Repondu.videoMessage ||
      msg_Repondu.stickerMessage;

    if (!mediaMessage) {
      return ovl.sendMessage(ms_org, {
        text: "Type de fichier non supporté. Veuillez mentionner une image, vidéo ou sticker.",
      }, { quoted: ms });
    }

    try {
      const media = await ovl.dl_save_media_ms(mediaMessage);
      const image = sharp(media);
      const { width, height } = await image.metadata();

      const text = arg.join(" ").toUpperCase();
      let fontSize = Math.floor(width / 10);
      if (fontSize < 20) fontSize = 20;
      const lineHeight = fontSize * 1.2;
      const maxWidth = width * 0.8;

      function wrapText(text, maxWidth) {
        const words = text.split(" ");
        let lines = [];
        let line = "";

        words.forEach((word) => {
          let testLine = line + word + " ";
          let testWidth = testLine.length * (fontSize * 0.6);
          if (testWidth > maxWidth && line !== "") {
            lines.push(line.trim());
            line = word + " ";
          } else {
            line = testLine;
          }
        });

        lines.push(line.trim());
        return lines;
      }

      const lines = wrapText(text, maxWidth);
      const svgText = lines
        .map(
          (line, index) =>
            `<text x="50%" y="${
              height - (lines.length - index) * lineHeight
            }" font-size="${fontSize}" font-family="Arial" fill="white" text-anchor="middle" stroke="black" stroke-width="${
              fontSize / 15
            }">${line}</text>`
        )
        .join("");

      const svg = `<svg width="${width}" height="${height}">${svgText}</svg>`;
      const modifiedImage = await image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).toBuffer();

      const fileName = `${Math.floor(Math.random() * 10000)}.webp`;
      await sharp(modifiedImage).webp().toFile(fileName);

      await ovl.sendMessage(ms_org, { sticker: fs.readFileSync(fileName) }, { quoted: ms }, { quoted: ms });

      fs.unlinkSync(fileName);
      fs.unlinkSync(media);
    } catch (error) {
      await ovl.sendMessage(ms_org, {
        text: `Une erreur est survenue lors de l'ajout du texte : ${error.message}`,
      }, { quoted: ms });
    }
  }
);

const remini = async (image, filterType) => {
  const availableFilters = ['enhance', 'recolor', 'dehaze'];
  const selectedFilter = availableFilters.includes(filterType) ? filterType : availableFilters[0];
  const apiUrl = `https://inferenceengine.vyro.ai/${selectedFilter}`;

  const form = new FormData();
  form.append('model_version', 1);

  const imageBuffer = Buffer.isBuffer(image) ? image : readFileSync(image);
  form.append('image', imageBuffer, {
    filename: 'enhance_image_body.jpg',
    contentType: 'image/jpeg',
  });

  const response = await axios.post(apiUrl, form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'okhttp/4.9.3',
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip',
    },
    responseType: 'arraybuffer',
  });
  return Buffer.from(response.data);
};

ovlcmd(
  {
    nom_cmd: "remini",
    classe: "Conversion",
    react: "🖼️",
    desc: "Amélioration de la qualité des images"
  },
  async (ms_org, ovl, cmd_options) => {
    const { msg_Repondu, ms } = cmd_options;

	const msg_cible = msg_Repondu || ms.message;
    if (!msg_cible?.imageMessage) {
      return ovl.sendMessage(ms_org, {
        text: "Veuillez répondre à une image pour améliorer sa qualité.",
      }, { quoted: ms });
    }

    try {
      const image = await ovl.dl_save_media_ms(msg_cible.imageMessage);
      if (!image) {
        return ovl.sendMessage(ms_org, {
          text: "Impossible de télécharger l'image. Réessayez.",
        }, { quoted: ms });
      }

      try {
        const url = await uploadToCatbox(image);
        const rmImage = await axios.get(`https://www.itzky.xyz/api/remini?url=${url}`);

        await ovl.sendMessage(ms_org, {
          image: { url: rmImage.data.result },
          caption: "```Powered By OVL-MD-V2```",
        }, { quoted: ms });
        return;
      } catch {
	  }

      try {
        const enhancedImageBuffer = await remini(image, 'enhance');
        await ovl.sendMessage(ms_org, {
          image: enhancedImageBuffer,
          caption: "```Powered By OVL-MD-V2```",
        }, { quoted: ms });
      } catch {
        await ovl.sendMessage(ms_org, {
          text: "Une erreur est survenue pendant le traitement de l'image avec les deux services.",
        }, { quoted: ms });
      }
    } catch {
      return ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue pendant le traitement de l'image.",
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "emix",
    classe: "Conversion",
    react: "🌟",
    desc: "Mixes deux emojis pour créer un sticker"
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, prefixe, ms } = cmd_options;

    if (!arg || arg.length < 1) return ovl.sendMessage(ms_org, { text: `Example: ${prefixe}emix 😅;🤔` }, { quoted: ms });

let [emoji1, emoji2] = arg[0].split(';');

    try {
      let response = await axios.get(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`);
      let data = response.data;

      if (!data.results || data.results.length === 0) {
        return ovl.sendMessage(ms_org, { text: "Aucun résultat trouvé pour ces emojis." }, { quoted: ms });
      }

      for (let res of data.results) {
        const imageBuffer = await axios.get(res.url, { responseType: 'arraybuffer' }).then(res => res.data);

        const sticker = new Sticker(imageBuffer, {
          pack: config.STICKER_PACK_NAME,
          author: config.STICKER_AUTHOR_NAME,
          type: StickerTypes.FULL,
          quality: 100,
        });

        const stickerFileName = `${Math.floor(Math.random() * 10000)}.webp`;
        await sticker.toFile(stickerFileName);

        await ovl.sendMessage(ms_org, {
          sticker: fs.readFileSync(stickerFileName),
        }, { quoted: ms });

        fs.unlinkSync(stickerFileName);
      }
    } catch (error) {
      console.error('Erreur:', error);
      return ovl.sendMessage(ms_org, { text: "Une erreur est survenue lors de la recherche de l'image." }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tts",
    classe: "Conversion",
    react: "🔊",
    desc: "Convertit un texte en parole et renvoie l'audio.",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, prefixe, ms } = cmd_options;

    if (!arg[0]) {
      return ovl.sendMessage(ms_org, {
        text: `Entrez un texte à lire.`,
      }, { quoted: ms });
    }

    let lang = 'fr';
    let textToRead = arg.join(' ');

    if (arg[0].length === 2) {
      lang = arg[0];
      textToRead = arg.slice(1).join(' ');
    }

    try {
      const gtts = new gTTS(textToRead, lang);
      const audioPath = path.join(__dirname, 'output.mp3');

      gtts.save(audioPath, function (err, result) {
        if (err) {
          return ovl.sendMessage(ms_org, {
            text: "Une erreur est survenue lors de la conversion en audio. Veuillez réessayer plus tard.",
          }, { quoted: ms });
        }

        const audioBuffer = fs.readFileSync(audioPath);

        const message = {
          audio: audioBuffer,
          mimetype: "audio/mpeg",
          caption: `\`\`\`Powered By OVL-MD-V2\`\`\``,
        };

        ovl.sendMessage(ms_org, message, { quoted: ms }).then(() => {
          fs.unlinkSync(audioPath);
        });
      });

    } catch (error) {
      return ovl.sendMessage(ms_org, {
        text: "Une erreur est survenue lors de la conversion en audio. Veuillez réessayer plus tard.",
      }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "attp",
    classe: "Conversion",
    react: "📥",
    desc: "Transforme du texte en sticker animé",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, nom_Auteur_Message, ms } = cmd_options;
    if (!arg[0]) return repondre("Veuillez fournir du texte");

    const text = arg.join(' ');

    try {
      const response = await axios.get(`https://api-ovl.koyeb.app/attp?texte=${encodeURIComponent(text)}`, {
        responseType: 'arraybuffer',
      });

      const stickerBuffer = await new Sticker(response.data, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: 90,
        background: "transparent",
      }).toBuffer();

      await ovl.sendMessage(ms_org, { sticker: stickerBuffer }, { quoted: ms });

    } catch (err) {
      console.error(err);
      repondre("❌ Une erreur est survenue lors de la génération du sticker animé.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "ttp",
    classe: "Conversion",
    react: "📥",
    desc: "Transforme du texte en sticker",
  },
  async (ms_org, ovl, cmd_options) => {
    const { arg, repondre, nom_Auteur_Message, ms } = cmd_options;
    if (!arg[0]) return repondre("Veuillez fournir du texte");

    const text = arg.join(' ');

    try {
      const response = await axios.get(`https://api-ovl.koyeb.app/ttp?texte=${encodeURIComponent(text)}`, {
        responseType: 'arraybuffer',
      });

      const stickerBuffer = await new Sticker(response.data, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: 70,
        background: "transparent",
      }).toBuffer();

      await ovl.sendMessage(ms_org, { sticker: stickerBuffer }, { quoted: ms });

    } catch (err) {
      console.error(err);
      repondre("❌ Une erreur est survenue lors de la génération du sticker.");
    }
  }
);

async function convertWebpToMp4({ file, filename, url }) {
  try {
    if (!file && !url) throw new Error("Un fichier ou une URL est requis.");
    if (file && !filename) throw new Error("Le nom du fichier est requis pour les fichiers envoyés.");

    const form = new FormData();
    if (file) form.append("new-image", file, { filename });
    if (url) form.append("new-image-url", url);

    const uploadRes = await axios.post("https://ezgif.com/webp-to-mp4", form, {
      headers: form.getHeaders(),
    });

    const redirOriginal = uploadRes?.request?.res?.responseUrl;
    if (!redirOriginal) throw new Error("Redirection introuvable.");

    const redirClean = redirOriginal.replace(/\.html$/, "");
    const id = redirClean.split("/").pop();

    const convRes = await axios.post(
      `${redirClean}?ajax=true`,
      new URLSearchParams({
        file: id,
        background: "#ffffff",
        backgroundc: "#ffffff",
        repeat: "1",
        ajax: "true"
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const html = convRes.data.toString();
    const start = "\" controls><source src=\"";
    const end = "\" type=\"video/mp4\">Your browser";
    const mp4 = html.split(start)?.[1]?.split(end)?.[0];

    if (!mp4) throw new Error("Conversion échouée.");

    return "https:" + mp4.replace("https:", "");
  } catch (err) {
    throw new Error("Erreur conversion WebP → MP4 : " + err);
  }
}

ovlcmd(
  {
    nom_cmd: "stickertovideo",
    classe: "Conversion",
    react: "🎞️",
    desc: "Convertit un sticker en vidéo MP4",
    alias: ["stovid"]
  },
  async (ms_org, ovl, cmd_options) => {
    const { ms, repondre, msg_Repondu } = cmd_options;

    try {
      if (!msg_Repondu || !msg_Repondu.stickerMessage) {
        return ovl.sendMessage(ms_org, { text: "Répondez à un sticker." }, { quoted: ms });
      }
      const cheminFichier = await ovl.dl_save_media_ms(msg_Repondu.stickerMessage)
      
      const stream = fs.createReadStream(cheminFichier);
      const mp4Url = await convertWebpToMp4({ file: stream, filename: "fichier.webp" });

      await ovl.sendMessage(ms_org, {
        video: { url: mp4Url },
        caption: `\`\`\`Powered By OVL-MD-V2\`\`\``,
      }, { quoted: ms });

      fs.unlinkSync(cheminFichier);
    } catch (err) {
      console.error(err);
      repondre("❌ Une erreur est survenue pendant la conversion.");
    }
  }
);

ovlcmd(
  {
    nom_cmd: "quotely",
    classe: "Conversion",
    react: "🖼️",
    desc: "Transforme un message cité en sticker stylisé.",
    alias: ["q"]
  },
  async (ms_org, ovl, { ms, msg_Repondu, repondre, auteur_Msg_Repondu }) => {
    const text = msg_Repondu?.conversation || msg_Repondu?.extendedTextMessage?.text;
    if (!text) return repondre('Veuillez répondre à un message texte.');

    let pfp;
    try {
      pfp = await ovl.profilePictureUrl(auteur_Msg_Repondu, "image");
    } catch (e) {
      pfp = "https://files.catbox.moe/8kvevz.jpg";
    }

    let tname;
    const user = await Ranks.findOne({ where: { id: auteur_Msg_Repondu } });
    if(user.name) { tname = user.name
		  } else { tname = "OVL-MD-USER";
			 }
    const couleurs = ["#FFFFFF", "#000000", "#1f1f1f", "#e3e3e3"];
    const backgroundColor = couleurs[Math.floor(Math.random() * couleurs.length)];

    const body = {
      type: "quote",
      format: "png",
      backgroundColor,
      width: 512,
      height: 512,
      scale: 3,
      messages: [{
        avatar: true,
        from: {
          first_name: tname,
          language_code: "fr",
          name: tname,
          photo: { url: pfp }
        },
        text,
        replyMessage: {},
      }],
    };

    try {
      const res = await axios.post("https://bot.lyo.su/quote/generate", body);
      const img = Buffer.from(res.data.result.image, "base64");

      const sticker = new Sticker(img, {
        pack: config.STICKER_PACK_NAME,
        author: config.STICKER_AUTHOR_NAME,
        type: StickerTypes.FULL,
        quality: 100,
      });

      const stickerFileName = `/tmp/quotely_${Date.now()}.webp`;
      await sticker.toFile(stickerFileName);

      await ovl.sendMessage(ms_org, {
        sticker: fs.readFileSync(stickerFileName)
      }, { quoted: ms });

      fs.unlinkSync(stickerFileName);

    } catch (err) {
      console.error("Erreur Quotely :", err.message || err);
      return repondre("Une erreur est survenue lors de la génération du sticker.");
    }
  }
);

ovlcmd(
    {
        nom_cmd: "tovv",
        classe: "Outils",
        react: "👀",
        desc: "envoie un message en vue unique dans la discussion",
    },
    async (ms_org, ovl, cmd_options) => {
        const { ms, msg_Repondu, repondre } = cmd_options;

        if (!msg_Repondu) {
            return repondre("Veuillez mentionner un message qui n'est pas en vue unique.");
        }

        let viewOnceKey = Object.keys(msg_Repondu).find(key => key.startsWith("viewOnceMessage"));
        let vue_Unique_Message = msg_Repondu;

        if (viewOnceKey) {
            vue_Unique_Message = msg_Repondu[viewOnceKey].message;
        }

        if (vue_Unique_Message) {
            if (
                (vue_Unique_Message.imageMessage && vue_Unique_Message.imageMessage.viewOnce == true) ||
                (vue_Unique_Message.videoMessage && vue_Unique_Message.videoMessage.viewOnce == true) ||
                (vue_Unique_Message.audioMessage && vue_Unique_Message.audioMessage.viewOnce == true)
            ) {
                return repondre("Ce message est un message en vue unique.");
            }
        }

        try {
            let media;
            let options = { quoted: ms };

            if (vue_Unique_Message.imageMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.imageMessage);
                await ovl.sendMessage(
                    ms_org,
                    { image: { url: media }, viewOnce: true, caption: vue_Unique_Message.imageMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.videoMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.videoMessage);
                await ovl.sendMessage(
                    ms_org,
                    { video: { url: media }, viewOnce: true, caption: vue_Unique_Message.videoMessage.caption || "" },
                    options
                );

            } else if (vue_Unique_Message.audioMessage) {
                media = await ovl.dl_save_media_ms(vue_Unique_Message.audioMessage);
                await ovl.sendMessage(
                    ms_org,
                    { audio: { url: media }, viewOnce: true, mimetype: "audio/mp4", ptt: false },
                    options
                );

            } else {
                return repondre("Ce type de message en vue unique n'est pas pris en charge.");
            }
        } catch (_error) {
            console.error("Erreur lors de l'envoi du message en vue unique :", _error.message || _error);
            return repondre("Une erreur est survenue lors du traitement du message.");
        }
    }
);

ovlcmd(
  {
    nom_cmd: "toaudio",
    classe: "Conversion",
    react: "🎧",
    desc: "Convertit une vidéo en audio"
  },
  async (ms_org, ovl, { msg_Repondu, ms }) => {
    if (!msg_Repondu || !msg_Repondu.videoMessage) {
      return ovl.sendMessage(ms_org, { text: "❌ Répondez à une *vidéo*." }, { quoted: ms });
    }

    try {
      const videoPath = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
      const output = path.join(os.tmpdir(), `aud_${Date.now()}.mp3`);

      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-i', videoPath,
          '-vn',
          '-acodec', 'libmp3lame',
          '-q:a', '4',
          output
        ]);

        ffmpeg.stderr.on('data', () => {});
        ffmpeg.on('close', code => {
          code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`));
        });
      });

      await ovl.sendMessage(ms_org, {
        audio: fs.readFileSync(output),
        mimetype: 'audio/mpeg'
      }, { quoted: ms });

      fs.unlinkSync(videoPath);
      fs.unlinkSync(output);
    } catch (err) {
      await ovl.sendMessage(ms_org, { text: `❌ Erreur de conversion : ${err.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "tovideo",
    classe: "Conversion",
    react: "🎬",
    desc: "Convertit un audio en vidéo animée"
  },
  async (ms_org, ovl, { msg_Repondu, ms }) => {

    if (!msg_Repondu || !msg_Repondu.audioMessage) {
      return ovl.sendMessage(ms_org, { text: "❌ Répondez à un *audio*." }, { quoted: ms });
    }

    try {
      const audioPath = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
		
      const duration = parseFloat(
        execSync(`ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "${audioPath}"`)
        .toString()
        .trim()
      );

      const basename = path.basename(audioPath, path.extname(audioPath));
      const dir = path.dirname(audioPath);
      const output = path.join(dir, `${basename}.mp4`);
 
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', [
          '-y',
          '-i', audioPath,
          '-f', 'lavfi',
          `-i`,
          `color=c=black:s=640x360:d=${duration}`,
          '-c:v', 'libx264',
          '-pix_fmt', 'yuv420p',
          '-c:a', 'aac',
          '-shortest',
          output
        ]);

        ffmpeg.stderr.on('data', () => {});
        ffmpeg.on('close', code => {
          code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`));
        });
      });

      await ovl.sendMessage(ms_org, { video: fs.readFileSync(output) }, { quoted: ms });

      fs.unlinkSync(audioPath);
      fs.unlinkSync(output);

    } catch (err) {
      await ovl.sendMessage(ms_org, { text: `❌ Erreur de conversion en vidéo : ${err.message}` }, { quoted: ms });
    }
  }
);

ovlcmd(
  {
    nom_cmd: "fusion",
    classe: "Conversion",
    react: "🎬",
    desc: "Fusionne un audio et une vidéo"
  },
  async (ms_org, ovl, { msg_Repondu, ms, auteur_Message, arg }) => {
    const userId = auteur_Message;
    fusionCache[userId] = fusionCache[userId] || {};

    if (arg[0]?.toLowerCase() === "result") {
      if (!fusionCache[userId].audioPath || !fusionCache[userId].videoPath) {
        return ovl.sendMessage(
          ms_org,
          { text: "❌ Audio ou vidéo manquant." },
          { quoted: ms }
        );
      }

      const { audioPath, videoPath } = fusionCache[userId];
      const output = path.join(
        path.dirname(videoPath),
        `fusion_${Date.now()}.mp4`
      );

      try {
        await new Promise((resolve, reject) => {
          const ffmpeg = spawn("ffmpeg", [
            "-y",
            "-i", videoPath,
            "-i", audioPath,
            "-map", "0:v",
            "-map", "1:a",
            "-c:v", "copy",
            "-c:a", "aac",
            output
          ]);

          ffmpeg.on("close", code => {
            code === 0 ? resolve() : reject(new Error(`ffmpeg ${code}`));
          });
        });

        await ovl.sendMessage(
          ms_org,
          { video: fs.readFileSync(output) },
          { quoted: ms }
        );

        fs.unlinkSync(audioPath);
        fs.unlinkSync(videoPath);
        fs.unlinkSync(output);
        delete fusionCache[userId];
        return;
      } catch (e) {
        return ovl.sendMessage(
          ms_org,
          { text: "❌ Erreur lors de la fusion." },
          { quoted: ms }
        );
      }
    }

    if (msg_Repondu?.audioMessage) {
      if (fusionCache[userId].audioPath) {
        return ovl.sendMessage(
          ms_org,
          { text: "⚠️ Audio déjà enregistré. Envoyez une vidéo ou tapez *fusion result*." },
          { quoted: ms }
        );
      }

      const audioPath = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
      fusionCache[userId].audioPath = audioPath;

      if (fusionCache[userId].videoPath) {
        return ovl.sendMessage(
          ms_org,
          { text: "✅ Audio ajouté. Tapez *fusion result* pour obtenir la vidéo." },
          { quoted: ms }
        );
      }

      return ovl.sendMessage(
        ms_org,
        { text: "✅ Audio enregistré. Répondez maintenant à une vidéo." },
        { quoted: ms }
      );
    }

    if (msg_Repondu?.videoMessage) {
      if (fusionCache[userId].videoPath) {
        return ovl.sendMessage(
          ms_org,
          { text: "⚠️ Vidéo déjà enregistrée. Envoyez un audio ou tapez *fusion result*." },
          { quoted: ms }
        );
      }

      const videoPath = await ovl.dl_save_media_ms(msg_Repondu.videoMessage);
      fusionCache[userId].videoPath = videoPath;

      if (fusionCache[userId].audioPath) {
        return ovl.sendMessage(
          ms_org,
          { text: "✅ Vidéo ajoutée. Tapez *fusion result* pour obtenir le résultat." },
          { quoted: ms }
        );
      }

      return ovl.sendMessage(
        ms_org,
        { text: "✅ Vidéo enregistrée. Répondez maintenant à un audio." },
        { quoted: ms }
      );
    }

    return ovl.sendMessage(
      ms_org,
      { text: "❌ Répondez à un *audio* ou une *vidéo*." },
      { quoted: ms }
    );
  }
);
