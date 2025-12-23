let cmd = [];
let func = [];

function ovlcmd(obj, fonctions) {
    let cmd_info = obj;

    if (!cmd_info.classe) {
        cmd_info.classe = "Autres";
    }
    if (!cmd_info.react) {
        cmd_info.react = "🎐";
    }
    if (!cmd_info.desc) {
        cmd_info.desc = "Aucune description";
    }
    if (!cmd_info.alias) {
        cmd_info.alias = [];
    }
    if (typeof cmd_info.isfunc === "undefined") {
        cmd_info.isfunc = false;
    }

    cmd_info.fonction = fonctions;

    if (cmd_info.isfunc === true) {
        func.push(cmd_info);
    } else {
        cmd.push(cmd_info);
    }

    return cmd_info;
}

module.exports = {
    ovlcmd,
    Module: ovlcmd,
    cmd,
    func
};
