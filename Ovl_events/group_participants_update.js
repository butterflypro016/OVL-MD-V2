const { GroupSettings, Events2 } = require("../DataBase/events");
const { jidDecode } = require("@whiskeysockets/baileys");
const { getJid } = require('./Message_upsert_events');
const { groupCache } = require('../lib/groupeCache');
const config = require("../set");

const parseID = (jid) => {
  if (!jid) return jid;
  if (/:\d+@/gi.test(jid)) {
    const decode = jidDecode(jid) || {};
    return (decode.user && decode.server && `${decode.user}@${decode.server}`) || jid;
  }
  return jid;
};

async function envoyerWelcomeGoodbye(jid, participant, type, eventSettings, ovl) {
  const groupInfo = await ovl.groupMetadata(jid);
  const groupName = groupInfo.subject || "Groupe";
  const totalMembers = groupInfo.participants.length;
  const groupDesc = groupInfo.desc || "Aucune description";
  const userMention = `@${participant.split("@")[0]}`;

  const raw = {
    welcome: eventSettings.welcome_msg || `🎉Bienvenue @user\n👥Groupe: #groupe\n🔆Membres: #membre\n📃Description: ${groupDesc} #pp`,
    goodbye: eventSettings.goodbye_msg || `👋Au revoir @user #pp`,
  }[type];

  const audioMatch = raw.match(/#audio=(\S+)/i);
  const urlMatch = raw.match(/#url=(\S+)/i);
  const hasPP = raw.includes("#pp");
  const hasGPP = raw.includes("#gpp");

  let msg = raw
    .replace(/#audio=\S+/i, "")
    .replace(/#url=\S+/i, "")
    .replace(/#pp/gi, "")
    .replace(/#gpp/gi, "")
    .replace(/@user/gi, userMention)
    .replace(/#groupe/gi, groupName)
    .replace(/#membre/gi, totalMembers)
    .replace(/#desc/gi, groupDesc);

  const mentions = [participant];
  const contextInfo = { mentionedJid: mentions };

  let mediaType = null;
  let mediaUrl = null;

  if (urlMatch) {
    mediaUrl = urlMatch[1];
    const ext = mediaUrl.split(".").pop().toLowerCase();
    if (["mp4", "mov", "webm"].includes(ext)) mediaType = "video";
    else if (["jpg", "jpeg", "png", "webp"].includes(ext)) mediaType = "image";
    else mediaType = "document";
  } else if (hasPP) {
    try { mediaUrl = await ovl.profilePictureUrl(participant, 'image'); } catch { mediaUrl = "https://files.catbox.moe/82g8ey.jpg"; }
    mediaType = "image";
  } else if (hasGPP) {
    try { mediaUrl = await ovl.profilePictureUrl(jid, 'image'); } catch { mediaUrl = "https://files.catbox.moe/82g8ey.jpg"; }
    mediaType = "image";
  }

  if (mediaUrl && mediaType) {
    const message = {
      [mediaType]: { url: mediaUrl },
      caption: msg.trim() || undefined,
      mentions,
      contextInfo
    };
    if (mediaType === "video") {
      message.video.gifPlayback = true;
    }
    await ovl.sendMessage(jid, message);
  } else if (msg.trim()) {
    await ovl.sendMessage(jid, {
      text: msg.trim(),
      mentions,
      contextInfo
    });
  }

  if (audioMatch) {
    const audioUrl = audioMatch[1];
    await ovl.sendMessage(jid, {
      audio: { url: audioUrl },
      mimetype: "audio/mpeg",
    });
  }
}

async function group_participants_update(data, ovl) {
  try {
    const groupInfo = await ovl.groupMetadata(data.id);
    groupCache.set(data.id, groupInfo);
    const metadata = groupInfo;
    const settings = await GroupSettings.findOne({ where: { id: data.id } });
    const eventSettings = await Events2.findOne({ where: { id: data.id } });
    if (!settings) return;

    const { welcome, goodbye, antipromote, antidemote } = settings;
    const promoteAlert = eventSettings?.promoteAlert || 'non';
    const demoteAlert = eventSettings?.demoteAlert || 'non';

    for (const participant of data.participants) {
      const actor = data.author;
      const actorMention = actor ? `@${actor.split("@")[0]}` : "quelqu’un";
      const userMention = `@${participant.phoneNumber.split("@")[0]}`;
      const mentions = actor ? [participant.phoneNumber, actor] : [participant.phoneNumber];
      const contextInfo = { mentionedJid: mentions };

      if (data.action == 'add' && welcome == 'oui') {
        if (eventSettings) await envoyerWelcomeGoodbye(data.id, participant.phoneNumber, "welcome", eventSettings, ovl);
      }

      if (data.action == 'remove' && goodbye == 'oui') {
        if (eventSettings) await envoyerWelcomeGoodbye(data.id, participant.phoneNumber, "goodbye", eventSettings, ovl);
      }

      if (data.action == 'promote' || data.action == 'demote') {
        const authorJid = await getJid(data.author, data.id, ovl);
        const ownerJid = await getJid(metadata.owner, data.id, ovl);
        const botJid = await getJid(parseID(ovl.user.id), data.id, ovl);
        const participantJid = await getJid(participant.phoneNumber, data.id, ovl);
        const ownerNumJid = await getJid(config.NUMERO_OWNER + '@s.whatsapp.net', data.id, ovl);
        const exemptJid1 = await getJid("22605463559@s.whatsapp.net", data.id, ovl);
        const exemptJid2 = await getJid("22651463203@s.whatsapp.net", data.id, ovl);

        const isExempted = [ownerJid, botJid, ownerNumJid, participantJid, exemptJid1, exemptJid2].includes(authorJid);

        if (data.action == 'promote') {
          if (antipromote == 'oui' && isExempted) continue;
          if (antipromote == 'oui') {
            await ovl.groupParticipantsUpdate(data.id, [participant.phoneNumber], "demote");
            await ovl.sendMessage(data.id, { text: `🚫 *Promotion refusée !*\n${actorMention} n’a pas le droit de promouvoir ${userMention}.`, mentions, contextInfo });
          } else if (promoteAlert == 'oui') {
            let pp = "https://files.catbox.moe/82g8ey.jpg";
            try { pp = await ovl.profilePictureUrl(participant.phoneNumber, 'image'); } catch {}
            await ovl.sendMessage(data.id, { image: { url: pp }, caption: `🆙 ${userMention} a été promu par ${actorMention}.`, mentions, contextInfo });
          }
        }

        if (data.action == 'demote') {
          if (antidemote == 'oui' && isExempted) continue;
          if (antidemote == 'oui') {
            await ovl.groupParticipantsUpdate(data.id, [participant.phoneNumber], "promote");
            await ovl.sendMessage(data.id, { text: `🚫 *Rétrogradation refusée !*\n${actorMention} ne peut pas rétrograder ${userMention}.`, mentions, contextInfo });
          } else if (demoteAlert == 'oui') {
            let pp = "https://files.catbox.moe/82g8ey.jpg";
            try { pp = await ovl.profilePictureUrl(participant.phoneNumber, 'image'); } catch {}
            await ovl.sendMessage(data.id, { image: { url: pp }, caption: `⬇️ ${userMention} a été rétrogradé par ${actorMention}.`, mentions, contextInfo });
          }
        }
      }
    }
  } catch (err) {
    console.error("❌ Erreur group_participants_update :", err);
  }
}

module.exports = group_participants_update;
