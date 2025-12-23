const { dl_save_media_ms, recup_msg } = require('./autres_fonctions');

module.exports = {
  message_upsert: require('./message_upsert'),
  group_participants_update: require('./group_participants_update'),
  group_update: require('./group_update'),
  connection_update: require('./connection'),
  call: require('./call'),
  dl_save_media_ms,
  recup_msg,
};
