const { WA_CONF } = require('../../DataBase/wa_conf');

async function dl_status(ovl, ms_org, ms, id_bot) {
    const settings = await WA_CONF.findOne({ where: { id: '1' } });
    if (settings) {
        if (ms_org === "status@broadcast" && settings.dl_status === "oui") {
            try {
                if (ms.message.extendedTextMessage) {
                    await ovl.sendMessage(id_bot, { text: ms.message.extendedTextMessage.text }, { quoted: ms });
                } else if (ms.message.imageMessage) {
                    let imgs = await ovl.dl_save_media_ms(ms.message.imageMessage);
                    await ovl.sendMessage(id_bot, { image: { url: imgs }, caption: ms.message.imageMessage.caption }, { quoted: ms });
                } else if (ms.message.videoMessage) {
                    let vids = await ovl.dl_save_media_ms(ms.message.videoMessage);
                    await ovl.sendMessage(id_bot, { video: { url: vids }, caption: ms.message.videoMessage.caption }, { quoted: ms });
                }
            } catch (err) {
                console.error("Erreur lors du traitement du message status:", err);
            }
        }
    }
}

module.exports = dl_status;
