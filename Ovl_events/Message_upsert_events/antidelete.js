const { WA_CONF } = require('../../DataBase/wa_conf');

async function antidelete(ovl, ms, auteur_Message, mtype, getMessage, ms_org, id_bot) {
  const settings = await WA_CONF.findOne({ where: { id: '1' } });
  if (!settings) return;

  try {
    const antideleteConfig = settings.antidelete;
    const modesSansTiret = ['pm', 'gc', 'status', 'all', 'pm/gc', 'pm/status', 'gc/status'];
    const isModeValide = modesSansTiret.some(mode => antideleteConfig.startsWith(mode));
    if (!isModeValide) return;

    if (mtype === 'protocolMessage') {
      const deletedMsgKey = ms.message.protocolMessage;
      if (!deletedMsgKey?.key?.id) return;

      const deletedMsg = getMessage(deletedMsgKey.key.id);
      if (!deletedMsg) return;

      const jid = deletedMsg.key.remoteJidAlt || deletedMsg.key.remoteJid;
      const isGroup = jid?.endsWith('@g.us');
      const sender = isGroup ? (deletedMsg.key.participant || deletedMsg.participant) : jid;
      const deletionTime = new Date().toISOString().substr(11, 8);

      if (!deletedMsg.key.fromMe) {
        function modeMatch(mode) {
          return antideleteConfig.includes(mode);
        }

        const shouldSend =
          (modeMatch('gc') && jid.endsWith('@g.us')) ||
          (modeMatch('pm') && jid.endsWith('@s.whatsapp.net')) ||
          (modeMatch('status') && jid.endsWith('status@broadcast')) ||
          modeMatch('all') ||
          (modeMatch('pm/gc') && (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net'))) ||
          (modeMatch('pm/status') && (jid.endsWith('status@broadcast') || jid.endsWith('@s.whatsapp.net'))) ||
          (modeMatch('gc/status') && (jid.endsWith('@g.us') || jid.endsWith('status@broadcast')));

        if (!shouldSend) return;

        if (antideleteConfig.includes('-org')) {
          if (antideleteConfig.includes('status') && jid.endsWith('status@broadcast')) {
            await ovl.sendMessage(id_bot, {
              forward: deletedMsg,
              contextInfo: {
                externalAdReply: { title: 'OVL-MD-V2-ANTIDELETE' }
              }
            }, { quoted: deletedMsg });
          } else {
            if (!ms_org) return;

            const contenu = deletedMsg.message;
            const typeMsg = Object.keys(contenu || {})[0];

            if (typeMsg === 'conversation' || typeMsg === 'extendedTextMessage') {
              const texte = contenu?.conversation || contenu?.extendedTextMessage?.text || '📝 Message supprimé (vide)';
              await ovl.sendMessage(ms_org, {
                text: texte,
                contextInfo: {
                  externalAdReply: { title: 'OVL-MD-V2-ANTIDELETE' }
                }
              }, { quoted: deletedMsg });
            } else {
              await ovl.sendMessage(ms_org, {
                forward: deletedMsg,
                contextInfo: {
                  externalAdReply: { title: 'OVL-MD-V2-ANTIDELETE' }
                }
              }, { quoted: deletedMsg });
            }
          }
        } else {
          const provenance = isGroup
            ? `👥 Groupe : ${(await ovl.groupMetadata(jid)).subject}`
            : `📩 Chat : @${jid.split('@')[0]}`;
          const header = `
✨ OVL-MD ANTI-DELETE MSG ✨
👤 Envoyé par : @${sender.split('@')[0]}
❌ Supprimé par : @${auteur_Message.split('@')[0]}
⏰ Heure de suppression : ${deletionTime}
${provenance}
          `.trim();

          await ovl.sendMessage(id_bot, {
            text: header,
            mentions: [sender, auteur_Message]
          }, { quoted: deletedMsg });

          await ovl.sendMessage(id_bot, {
            forward: deletedMsg
          }, { quoted: deletedMsg });
        }
      }
    }
  } catch (err) {
    console.error('❌ Une erreur est survenue dans antidelete :', err);
  }
}

module.exports = antidelete;
