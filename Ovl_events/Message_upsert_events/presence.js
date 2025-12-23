const { WA_CONF } = require('../../DataBase/wa_conf');

async function presence(ovl, ms_org) {
    const settings = await WA_CONF.findOne({ where: { id: '1' } });
    if (settings) {
        if (settings.presence === 'enligne') {
            await ovl.sendPresenceUpdate("available", ms_org);
        } else if (settings.presence === 'ecrit') {
            await ovl.sendPresenceUpdate("composing", ms_org);
        } else if (settings.presence === 'enregistre') {
            await ovl.sendPresenceUpdate("recording", ms_org);
        }
    }
}

module.exports = presence;
