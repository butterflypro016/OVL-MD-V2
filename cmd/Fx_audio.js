const fs = require("fs");
const { exec } = require("child_process");
const { ovlcmd } = require("../lib/ovlcmd");

function addAudioEffectCommand(nom_cmd, ffmpeg_filter) {
    ovlcmd(
        {
            nom_cmd: nom_cmd,
            classe: "FX_Audio",
            react: "🎶",
            desc: `Applique l'effet "${nom_cmd}" à un audio.`
        },
        async (ms_org, ovl, { ms, msg_Repondu, repondre }) => {
            if (!msg_Repondu?.audioMessage) {
                return repondre(`Réponds à un message audio*`);
            }

            try {
                const inputPath = await ovl.dl_save_media_ms(msg_Repondu.audioMessage);
                const outputPath = "output.mp3";

                exec(`ffmpeg -i ${inputPath} ${ffmpeg_filter} ${outputPath}`, async (err) => {
                    fs.unlinkSync(inputPath);
                    if (err) return repondre("Erreur FFmpeg : " + err.message);

                    const audioBuffer = fs.readFileSync(outputPath);
                    await ovl.sendMessage(ms_org, { audio: audioBuffer, mimetype: 'audio/mpeg' }, { quoted: ms });
                    fs.unlinkSync(outputPath);
                });
            } catch (e) {
                console.error("Erreur AudioFX :", e);
                repondre("Une erreur est survenue lors du traitement.");
            }
        }
    );
}

addAudioEffectCommand("bass", '-af equalizer=f=54:width_type=o:width=2:g=20');
addAudioEffectCommand("blown", '-af acrusher=.1:1:64:0:log');
addAudioEffectCommand("deep", '-af atempo=4/4,asetrate=44500*2/3');
addAudioEffectCommand("earrape", '-af volume=12');
addAudioEffectCommand("fast", '-filter:a "atempo=1.63,asetrate=44100"');
addAudioEffectCommand("fat", '-filter:a "atempo=1.6,asetrate=22100"');
addAudioEffectCommand("nightcore", '-filter:a atempo=1.06,asetrate=44100*1.25');
addAudioEffectCommand("reverse", '-filter_complex "areverse"');
addAudioEffectCommand("robot", '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"');
addAudioEffectCommand("slow", '-filter:a "atempo=0.7,asetrate=44100"');
addAudioEffectCommand("smooth", '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"');
addAudioEffectCommand("squirrel", '-filter:a "atempo=0.5,asetrate=65100"');
addAudioEffectCommand("muted", '-af "volume=0.3"');
addAudioEffectCommand("echo", '-af "aecho=0.8:0.9:1000:0.3"');
addAudioEffectCommand("reverb", '-af "aecho=0.8:0.88:60:0.4"');
addAudioEffectCommand("chipmunk", '-af asetrate=44100*2.0,atempo=0.5');
addAudioEffectCommand("vibrato", '-af "vibrato=f=5.0:d=0.5"');
addAudioEffectCommand("tremolo", '-af "tremolo=f=10:d=0.7"');
addAudioEffectCommand("cave", '-af "aecho=0.6:0.6:50:0.2"');
addAudioEffectCommand("underwater", '-af "afftdn=nf=-25, lowpass=f=300"');
addAudioEffectCommand("telephone", '-af "bandpass=f=1000:width_type=h:width=200"');
addAudioEffectCommand("haunting", '-af "apulsator=mode=sine:hz=0.5"');
addAudioEffectCommand("distortion", '-af "acompressor=threshold=0.3:ratio=9:attack=200:release=1000"');
addAudioEffectCommand("vintage", '-af "highpass=f=200, lowpass=f=3000"');
addAudioEffectCommand("phaser", '-af "aphaser=in_gain=0.4"');
addAudioEffectCommand("chorus", '-af "chorus=0.5:0.9:50:0.5:0.4:40"');
addAudioEffectCommand("flanger", '-af "flanger"');
addAudioEffectCommand("compressor", '-af "acompressor"');
addAudioEffectCommand("surround", '-af "surround"');
addAudioEffectCommand("panorama", '-af "pan=stereo|c0=c0|c1=c1"');
addAudioEffectCommand("mono", '-af "pan=mono|c0=.5*c0+.5*c1"');
addAudioEffectCommand("invert", '-af "aphaser=in_gain=-1"');
addAudioEffectCommand("radio", '-af "highpass=f=300, lowpass=f=3400"');
addAudioEffectCommand("alien", '-af "atempo=1.5,asetrate=44100*0.7"');
addAudioEffectCommand("ghost", '-af "aecho=0.8:0.88:100:0.3"');
addAudioEffectCommand("dizzy", '-af "apulsator=hz=1"');
addAudioEffectCommand("buzz", '-af "superequalizer=1b=5:3b=4:5b=3:7b=2"');
addAudioEffectCommand("lofi", '-af "lowpass=f=500"');
addAudioEffectCommand("space", '-af "aecho=0.9:0.9:1000:0.5"');
addAudioEffectCommand("dark", '-af "bass=g=5"');
