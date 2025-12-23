const { WA_CONF2 } = require("../DataBase/wa_conf");

async function call(ovl, callEvent) {
  try {
    const call = callEvent[0];
    const caller = call?.from;
    const callId = call?.id;

    if (!caller || !callId) return;

    const config = await WA_CONF2.findOne({ where: { id: "1" } });
    if (!config || config.anticall !== "oui") return;

    await ovl.sendMessage(caller, {
      text: `❌ Les appels ne sont pas autorisés sur ce numéro !`,
    });

    await ovl.rejectCall(callId, caller);

  } catch (error) {
    console.error("Erreur lors du traitement de l’appel :", error);
  }
}

module.exports = call;
