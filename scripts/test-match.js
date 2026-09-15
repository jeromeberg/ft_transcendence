const { io } = require('../frontend/node_modules/socket.io-client')

const API    = 'http://localhost:3000'
const WS_URL = `${API}/game`
const PASS   = ''

const TEST = process.argv[2] || 'normal'

const PLAYERS = [
  { email: 'akhmed.dovletov@typerun.dev', label: 'Akhmed' },
  { email: 'kevin.pires@typerun.dev',     label: 'Kevin'  },
]

async function getToken(email, password) {
  const res  = await fetch(`${API}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Login failed for ${email}: ${JSON.stringify(data)}`)
  return data.access_token
}

function createSocket(token, label, opts = {}) {
  const socket = io(WS_URL, { auth: { token } })

  socket.on('connect',       () => { console.log(`[${label}] connecte: ${socket.id}`); socket.emit('join_queue') })
  socket.on('connect_error', (e) => console.log(`[${label}] erreur: ${e.message}`))
  socket.on('disconnect',    ()  => console.log(`[${label}] deconnecte`))
  socket.on('opponent_disconnected', (d) => {
    console.log(`[${label}] opponent_disconnected — username:${d.username} cancelled:${d.cancelled}`)
    if (d.cancelled) socket.disconnect()
  })

  let matchText = ''

  socket.on('match_found', (d) => {
    matchText = d.text
    console.log(`[${label}] match_found — texte: "${d.text}"`)
  })

  socket.on('countdown', (d) => console.log(`[${label}] countdown: ${d.time}`))

  socket.on('race_start', () => {
    console.log(`[${label}] GO!`)

    if (TEST === 'disconnect' && opts.disconnectAfter) {
      setTimeout(() => {
        console.log(`[${label}] disconnect force`)
        socket.disconnect()
      }, opts.disconnectAfter)
      return
    }

    if (TEST === 'invalid') {
      socket.emit('player_progress', {})
      socket.emit('player_progress', { chars: 'abc' })
      socket.emit('player_progress', null)
      console.log(`[${label}] payloads invalides envoyes`)
      return
    }

    if (TEST === 'cheat') {
      socket.emit('player_progress', { chars: 9999 })
      console.log(`[${label}] chars=9999 envoye`)
      return
    }

    let chars = 0
    const speed = opts.speed || 5
    const interval = setInterval(() => {
      chars = Math.min(chars + speed, matchText.length)
      socket.emit('player_progress', { chars })
      if (chars >= matchText.length) clearInterval(interval)
    }, 500)
  })

  socket.on('race_update', (d) => {
    console.log(`[${label}] race_update — userId:${d.userId} progress:${(d.progress * 100).toFixed(0)}% wpm:${d.wpm}`)
  })

  socket.on('race_finished', (d) => {
    console.log(`[${label}] race_finished`)
    d.results?.forEach(r => console.log(`   ${r.position}. ${r.username} — ${r.wpm} WPM`))
    socket.disconnect()
  })

  return socket
}

async function main() {
  console.log(`TEST: ${TEST}\n`)
  const tokens = await Promise.all(PLAYERS.map(p => getToken(p.email, PASS)))
  console.log('Tokens OK\n')

  if (TEST === 'disconnect') {
    createSocket(tokens[0], 'Akhmed', { disconnectAfter: 3000 })
    createSocket(tokens[1], 'Kevin')
  } else if (TEST === 'normal') {
    createSocket(tokens[0], 'Akhmed', { speed: 7 })
    createSocket(tokens[1], 'Kevin',  { speed: 4 })
  } else {
    createSocket(tokens[0], 'Akhmed')
    createSocket(tokens[1], 'Kevin')
  }
}

main().catch(console.error)
