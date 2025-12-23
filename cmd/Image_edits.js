const { ovlcmd } = require("../lib/ovlcmd");
const axios = require("axios");
const FormData = require("form-data");

const effetsCanvacord = [
  "shit",
  "wasted",
  "wanted",
  "trigger",
  "trash",
  "rip",
  "sepia",
  "rainbow",
  "hitler",
  "invert1",
  "jail",
  "affect",
  "beautiful",
  "blur",
  "circle1",
  "facepalm",
  "greyscale",
  "jokeoverhead",
  "delete_image",
  "darkness",
  "colorfy",
  "threshold",
  "pixelate"
];

function genererCommandeCanvacord(nomCommande) {
  ovlcmd(
    {
      nom_cmd: nomCommande,
      classe: "Image_Edits",
      react: "🎨",
      desc: `Applique l'effet ${nomCommande} via l'API`,
    },
    async (ms_org, ovl, options) => {
      const { arg, ms, getJid, auteur_Msg_Repondu, msg_Repondu, auteur_Message } = options;

      try {
        const msg_cible = msg_Repondu || ms.message;
        let imageUrl;
        let useFormData = false;

        if (msg_cible?.imageMessage) {
          const cheminFichier = await ovl.dl_save_media_ms(msg_cible.imageMessage);
          imageUrl = cheminFichier;
          useFormData = true;
        } else if (arg[0]?.startsWith("http")) {
          imageUrl = arg[0];
        } else {
          const cbl =
            auteur_Msg_Repondu ||
            (arg[0]?.includes("@") && `${arg[0].replace("@", "")}@lid`) ||
            auteur_Message;

          const cible = await getJid(cbl, ms_org, ovl);
          try {
            imageUrl = await ovl.profilePictureUrl(cible, "image");
          } catch {
            imageUrl = "https://files.catbox.moe/ulwqtr.jpg";
          }
        }

        let response;
        if (useFormData) {
          const form = new FormData();
          form.append("file", require("fs").createReadStream(imageUrl));
          response = await axios.post(
            `https://api-ovl.koyeb.app/img-effect/${nomCommande}`,
            form,
            { headers: form.getHeaders(), responseType: "arraybuffer" }
          );
        } else {
          response = await axios.get(
            `https://api-ovl.koyeb.app/img-effect/${nomCommande}?url=${encodeURIComponent(imageUrl)}`,
            { responseType: "arraybuffer" }
          );
        }

        await ovl.sendMessage(ms_org, { image: Buffer.from(response.data) }, { quoted: ms });

      } catch (error) {
        console.error(`Erreur avec la commande "${nomCommande}":`, error);
      }
    }
  );
}

effetsCanvacord.forEach(nom => genererCommandeCanvacord(nom));
