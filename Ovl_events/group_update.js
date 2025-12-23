const { groupCache } = require('../lib/groupeCache');

async function group_update(data, ovl) {
  try {
    const groupInfo = await ovl.groupMetadata(data.id);
    groupCache.set(data.id, groupInfo);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du groupe :", err);
  }
}

module.exports = group_update;
