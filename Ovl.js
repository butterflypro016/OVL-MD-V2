const fs = require('fs')
const path = require('path')
const pino = require('pino')
const axios = require('axios')
const { exec } = require('child_process')
const {
  default: makeWASocket,
  makeCacheableSignalKeyStore,
  Browsers,
  delay,
  useMultiFileAuthState
} = require('@whiskeysockets/baileys')

const { getMessage } = require('./lib/store')
const { groupCache } = require('./lib/groupeCache')
const { get_session, restaureAuth } = require('./DataBase/session')
const config = require('./set')
const {
  message_upsert,
  group_participants_update,
  group_update,
  connection_update,
  call,
  dl_save_media_ms,
  recup_msg
} = require('./Ovl_events')
const { getSecondAllSessions } = require('./DataBase/connect')

const MAX_SESSIONS = 15
const sessionsActives = new Set()
const instancesSessions = new Map()

console.info = function (...args) {
  const msg = args.join(' ')
  if (!msg.startsWith('Closing') && !msg.startsWith('Removing old')) {
    console.log(...args)
  }
}

console.warn = function (...args) {
  const msg = args.join(' ')
  if (!msg.startsWith('Closing') && !msg.startsWith('Decrypted')) {
    console.log(...args)
  }
}

console.error = function (...args) {
  const msg = args.join(' ')
  if (
    !msg.startsWith('Session error') &&
    !msg.startsWith('Failed to decrypt') &&
    !msg.includes('`punycode`')
  ) {
    console.log(...args)
  }
}

async function startGenericSession({ numero, isPrincipale = false, sessionId = null }) {
  try {
    const instanceId = isPrincipale ? 'principale' : numero
    const sessionData = await get_session(sessionId)

    await restaureAuth(instanceId, sessionData.creds, sessionData.keys)

    const { state, saveCreds } = await useMultiFileAuthState(`./auth/${instanceId}`)

    const ovl = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(
          state.keys,
          pino({ level: 'silent' }).child({ level: 'silent' })
        )
      },
      logger: pino({ level: 'silent' }),
      browser: Browsers.ubuntu('Chrome'),
      printQRInTerminal: false,
      keepAliveIntervalMs: 10000,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: true,
      cachedGroupMetadata: async jid => groupCache.get(jid),
      getMessage: async key => {
        const msg = getMessage(key.id)
        return msg?.message || undefined
      }
    })

    ovl.ev.on('messages.upsert', m => message_upsert(m, ovl))
    ovl.ev.on('group-participants.update', d => group_participants_update(d, ovl))
    ovl.ev.on('groups.update', d => group_update(d, ovl))
    ovl.ev.on('connection.update', con =>
      connection_update(
        con,
        ovl,
        () => startGenericSession({ numero, isPrincipale, sessionId }),
        isPrincipale ? async () => await startSecondarySessions() : undefined
      )
    )
    ovl.ev.on('creds.update', saveCreds)
    ovl.ev.on('call', c => call(ovl, c))

    ovl.dl_save_media_ms = (msg, filename = '', attachExt = true, dir = './downloads') =>
      dl_save_media_ms(ovl, msg, filename, attachExt, dir)

    ovl.recup_msg = params => recup_msg({ ovl, ...params })

    instancesSessions.set(numero, ovl)
    sessionsActives.add(numero)

    console.log(
      `✅ Session ${isPrincipale ? 'principale' : 'secondaire ' + numero} démarrée`
    )

    return ovl
  } catch (err) {
    console.error(
      `❌ Erreur session ${isPrincipale ? 'principale' : numero} :`,
      err.message
    )
    return null
  }
}

async function stopSession(numero) {
  if (!instancesSessions.has(numero)) return

  const ovl = instancesSessions.get(numero)

  try {
    await ovl.ws.close()
    const dirPath = path.join(__dirname, './auth', numero)

    if (fs.existsSync(dirPath)) {
      await fs.promises.rm(dirPath, { recursive: true, force: true })
    }

    console.log(`🗑️ Dossier auth/${numero} supprimé`)
    console.log(`🛑 Session ${numero} arrêtée`)
  } catch (err) {
    console.error(`❌ Erreur arrêt session ${numero} :`, err.message)
  }

  instancesSessions.delete(numero)
  sessionsActives.delete(numero)
}

async function startSecondarySessions() {
  const sessions = await getSecondAllSessions()
  const numerosEnBase = new Set(sessions.map(s => s.numero))

  for (const numero of sessionsActives) {
    if (numero === 'principale') continue

    if (!numerosEnBase.has(numero)) {
      console.log(`⚠️ Session supprimée détectée : ${numero}`)
      await stopSession(numero)
    }
  }

  for (const { numero, session_id } of sessions) {
    if (sessionsActives.size >= MAX_SESSIONS) break

    if (!sessionsActives.has(numero)) {
      try {
        await startGenericSession({
          numero,
          isPrincipale: false,
          sessionId: session_id
        })
      } catch (err) {
        console.error(`❌ Échec session ${numero} :`, err.message)
      }
    }
  }
}

function surveillerNouvellesSessions() {
  setInterval(async () => {
    try {
      await startSecondarySessions()
    } catch (err) {
      console.error(
        '❌ Erreur vérification sessions secondaires :',
        err.message
      )
    }
  }, 10000)
}

async function startPrincipalSession() {
  await delay(45000)

  if (
    !(
      config.SESSION_ID &&
      config.SESSION_ID.startsWith('Ovl-MD_') &&
      config.SESSION_ID.endsWith('_SESSION-ID')
    )
  ) {
    return
  }

  await startGenericSession({
    numero: 'principale',
    isPrincipale: true,
    sessionId: config.SESSION_ID
  })

  surveillerNouvellesSessions()
}

;(async () => {
  await startPrincipalSession()
})()

const expressApp = require('express')
const app = expressApp()
const port = process.env.PORT || 3000

let dernierPingRecu = Date.now()

app.get('/', (req, res) => {
  dernierPingRecu = Date.now()
  res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>OVL-Bot Web Page</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{display:flex;justify-content:center;align-items:center;height:100vh;background:#121212;color:#fff;font-family:Arial}
.content{padding:30px;background:#1e1e1e;border-radius:12px}
</style>
</head>
<body>
<div class="content">
<h1>Bienvenue sur OVL-MD-V2</h1>
<p>Votre assistant WhatsApp</p>
</div>
</body>
</html>`)
})

let publicURL

if (process.env.RENDER_EXTERNAL_URL) {
  publicURL = process.env.RENDER_EXTERNAL_URL
} else if (process.env.KOYEB_PUBLIC_DOMAIN) {
  publicURL = `https://${process.env.KOYEB_PUBLIC_DOMAIN}`
} else {
  publicURL = `http://localhost:${port}`
}

function detectPlatform() {
  if (process.env.GITHUB_ACTIONS) return 'GitHub Actions'
  if (process.env.RENDER_EXTERNAL_URL) return 'Render'
  if (process.env.KOYEB_PUBLIC_DOMAIN) return 'Koyeb'
  if (process.env.TALKDROVE_APP_ID || process.env.TALKDROVE) return 'Talkdrove'
  if (process.env.DYNO) return 'Heroku'
  if (process.env.STARTUP) return 'Vps'
  return 'Inconnu'
}

app.listen(port, () => {
  console.log(`Listening on port: ${port}`)
  setupAutoPing(publicURL)
})

function setupAutoPing(url) {
  setInterval(async () => {
    try {
      const res = await axios.get(url)
      if (res.data) console.log('Ping: OVL-MD-V2 ✅')

      for (const [, ovlInstance] of instancesSessions) {
        if (ovlInstance?.user?.id) {
          const id = `https://wa.me/${ovlInstance.user.id.split(':')[0]}`
          await axios.post('https://dsh-u1dn.onrender.com/ping', {
            id,
            prefixe: config.PREFIXE,
            nom: config.NOM_BOT,
            platform: detectPlatform()
          })
        }
      }
    } catch {}
  }, 30000)
}

process.on('uncaughtException', e => {
  console.log('Une erreur inattendue est survenue :', e.message)
})

process.on('unhandledRejection', reason => {
  console.error('Rejection non gérée :', reason)
})
