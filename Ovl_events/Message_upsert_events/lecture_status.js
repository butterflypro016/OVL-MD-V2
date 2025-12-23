const { WA_CONF } = require('../../DataBase/wa_conf');

async function lecture_status(ovl, ms, ms_org) {
    const settings = await WA_CONF.findOne({ where: { id: '1' } });
    if (settings) {
        if (ms.key.remoteJid === "status@broadcast" && settings.lecture_status === "oui") {
            await ovl.readMessages([ms.key]);
        }
    }
}

module.exports = lecture_status;
