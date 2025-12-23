const fs = require('fs');
const path = require('path');

const storeFilePath = path.resolve(__dirname, 'store_msg.json');
const MAX_STORE_SIZE_MB = 5;

function checkAndResetStore() {
    try {
        const stats = fs.statSync(storeFilePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        if (fileSizeInMB > MAX_STORE_SIZE_MB) {
            console.warn(`Le fichier store_msg.json dépasse ${MAX_STORE_SIZE_MB} Mo. Réinitialisation...`);
            fs.writeFileSync(storeFilePath, JSON.stringify({}));
        }
    } catch (err) {
        console.error('Erreur lors de la vérification ou de la réinitialisation du fichier :', err);
    }
}

function getMessage(id) {
    try {
        const store = JSON.parse(fs.readFileSync(storeFilePath, 'utf8'));
        return store[id] || null;
    } catch (err) {
        console.error('Erreur lors de la lecture du fichier de stockage :', err);
        return null;
    }
}

function addMessage(id, messageDetails) {
    try {
        const store = JSON.parse(fs.readFileSync(storeFilePath, 'utf8'));
        store[id] = messageDetails;
        fs.writeFileSync(storeFilePath, JSON.stringify(store, null, 2));
        checkAndResetStore();
    } catch (err) {
        console.error('Erreur lors de l’ajout du message dans le fichier de stockage :', err);
    }
}

module.exports = {
    getMessage,
    addMessage,
};
