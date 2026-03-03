let player
let scoreEl, livesEl, finalScoreEl, highscoreEl
let score = 0
let lives = 3
let gameRunning = false

let fireballs = []
let bullets = []
let enemyBullets = []

let fireballSpawnRate = 800
let lastSpawn = 0

let baseSpeed = 4
let difficulty = 1
let lastDifficultyIncrease = 0

let highscore = 0

window.onload = () => {
  player = document.getElementById('player')
  scoreEl = document.getElementById('score-value')
  livesEl = document.getElementById('lives-value')
  finalScoreEl = document.getElementById('final-score')
  highscoreEl = document.getElementById('highscore-value')

  highscore = localStorage.getItem('pyroclastia-highscore') || 0
  highscoreEl.textContent = highscore

  document.getElementById('start-btn').onclick = startGame
  document.getElementById('restart-btn').onclick = startGame

  document.addEventListener('mousemove', movePlayer)
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameRunning) shoot()
  })
}

function startGame() {
  score = 0
  lives = 3
  difficulty = 1
  baseSpeed = 4
  fireballSpawnRate = 800

  fireballs.forEach(fb => fb.remove())
  bullets.forEach(b => b.remove())
  enemyBullets.forEach(eb => eb.remove())
  fireballs = []
  bullets = []
  enemyBullets = []

  scoreEl.textContent = score
  livesEl.textContent = lives

  gameRunning = true
  lastSpawn = Date.now()
  lastDifficultyIncrease = Date.now()

  document.getElementById('start-screen').style.display = 'none'
  document.getElementById('game-over').style.display = 'none'

  gameLoop()
}

function movePlayer(e) {
  if (!gameRunning) return
  let x = e.clientX - 20
  player.style.left = `${x}px`
}

function spawnFireball() {
  const fb = document.createElement('div')
  fb.classList.add('fireball')

  const types = ['normal', 'fast', 'zigzag', 'homing']
  fb.dataset.type = types[Math.floor(Math.random() * types.length)]

  fb.style.left = Math.random() * (window.innerWidth - 40) + 'px'
  fb.style.top = '-40px'

  fb.dataset.speed = baseSpeed + Math.random() * 2
  fb.dataset.angle = Math.random() * Math.PI * 2
  fb.dataset.lastShot = Date.now().toString()

  document.getElementById('fireballs').appendChild(fb)
  fireballs.push(fb)
}

function shoot() {
  const bullet = document.createElement('div')
  bullet.classList.add('bullet')

  const rect = player.getBoundingClientRect()
  bullet.style.left = rect.left + rect.width / 2 - 3 + 'px'
  bullet.style.top = rect.top - 20 + 'px'

  document.getElementById('bullets').appendChild(bullet)
  bullets.push(bullet)
}

function spawnEnemyBullet(x, y, angle, speed) {
  const eb = document.createElement('div')
  eb.classList.add('bullet')
  eb.style.background = '#ff4444'
  eb.style.boxShadow = '0 0 8px #ff4444'

  eb.style.left = x + 'px'
  eb.style.top = y + 'px'

  eb.dataset.angle = angle
  eb.dataset.speed = speed

  document.getElementById('bullets').appendChild(eb)
  enemyBullets.push(eb)
}

function enemyShoot(fb) {
  const now = Date.now()
  const lastShot = parseInt(fb.dataset.lastShot || '0', 10)
  const cooldown = 800 - Math.min(500, difficulty * 40)
  if (now - lastShot < cooldown) return

  const fireChance = 0.004 * difficulty 
  if (Math.random() > fireChance) return

  fb.dataset.lastShot = now.toString()

  const x = fb.offsetLeft + 15
  const y = fb.offsetTop + 20

  const patternRoll = Math.random()

  if (patternRoll < 0.5) {
    const count = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) + Math.PI / 2
      const speed = 6 + Math.random() * (4 + difficulty)
      spawnEnemyBullet(x, y, angle, speed)
    }
  } else if (patternRoll < 0.8) {
    const count = 3 + Math.floor(Math.random() * 3)
    const baseAngle = Math.PI / 2 + (Math.random() - 0.5) * 0.4
    for (let i = 0; i < count; i++) {
      const angle = baseAngle + (Math.random() - 0.5) * 0.3
      const speed = 7 + Math.random() * (5 + difficulty)
      spawnEnemyBullet(x, y, angle, speed)
    }
  } else {
    const count = 5 + Math.floor(Math.random() * 4)
    const spread = 0.9 // radians
    const startAngle = Math.PI / 2 - spread / 2
    for (let i = 0; i < count; i++) {
      const angle = startAngle + (spread / (count - 1)) * i + (Math.random() - 0.5) * 0.2
      const speed = 5 + Math.random() * (6 + difficulty)
      spawnEnemyBullet(x, y, angle, speed)
    }
  }
}

function gameLoop() {
  if (!gameRunning) return

  const now = Date.now()

  if (now - lastSpawn > fireballSpawnRate) {
    spawnFireball()
    lastSpawn = now
  }

  if (now - lastDifficultyIncrease > 5000) {
    difficulty++
    baseSpeed += 0.4 * difficulty
    fireballSpawnRate = Math.max(150, fireballSpawnRate - 40)
    lastDifficultyIncrease = now
  }

  updateFireballs()
  updateBullets()
  updateEnemyBullets()

  requestAnimationFrame(gameLoop)
}

function updateFireballs() {
  for (let i = fireballs.length - 1; i >= 0; i--) {
    const fb = fireballs[i]
    let x = fb.offsetLeft
    let y = fb.offsetTop
    let speed = parseFloat(fb.dataset.speed)
    const type = fb.dataset.type

    switch (type) {
      case 'normal':
        y += speed
        break
      case 'fast':
        y += speed * 1.8
        break
      case 'zigzag':
        y += speed
        x += Math.sin(Date.now() / 120) * 4
        break
      case 'homing':
        y += speed * 0.8
        const playerRect = player.getBoundingClientRect()
        const dx = (playerRect.left + 20) - x
        fb.dataset.angle = Math.atan2(dx, speed)
        x += Math.sin(fb.dataset.angle) * 2
        break
    }

    fb.style.left = `${x}px`
    fb.style.top = `${y}px`

    enemyShoot(fb)

    if (isColliding(player, fb)) {
      lives--
      livesEl.textContent = lives
      screenShake()
      explosion(x, y)

      fb.remove()
      fireballs.splice(i, 1)

      if (lives <= 0) {
        endGame()
        return
      }
      continue
    }

    if (y > window.innerHeight) {
      fb.remove()
      fireballs.splice(i, 1)
      score++
      scoreEl.textContent = score
    }
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i]
    b.style.top = b.offsetTop - 10 + 'px'

    if (b.offsetTop < -20) {
      b.remove()
      bullets.splice(i, 1)
      continue
    }

    for (let j = fireballs.length - 1; j >= 0; j--) {
      const fb = fireballs[j]
      if (isColliding(b, fb)) {
        explosion(fb.offsetLeft, fb.offsetTop)

        fb.remove()
        fireballs.splice(j, 1)

        b.remove()
        bullets.splice(i, 1)

        score += 5
        scoreEl.textContent = score
        break
      }
    }
  }
}

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const eb = enemyBullets[i]
    const angle = parseFloat(eb.dataset.angle)
    const speed = parseFloat(eb.dataset.speed)

    let x = eb.offsetLeft
    let y = eb.offsetTop

    x += Math.cos(angle) * speed
    y += Math.sin(angle) * speed

    eb.style.left = x + 'px'
    eb.style.top = y + 'px'

    if (isColliding(player, eb)) {
      lives--
      livesEl.textContent = lives
      screenShake()
      explosion(x, y)

      eb.remove()
      enemyBullets.splice(i, 1)

      if (lives <= 0) {
        endGame()
        return
      }
      continue
    }

    if (y > window.innerHeight + 50 || y < -50 || x < -50 || x > window.innerWidth + 50) {
      eb.remove()
      enemyBullets.splice(i, 1)
    }
  }
}

function isColliding(a, b) {
  const A = a.getBoundingClientRect()
  const B = b.getBoundingClientRect()

  return !(
    A.bottom < B.top ||
    A.top > B.bottom ||
    A.right < B.left ||
    A.left > B.right
  )
}

function screenShake() {
  const gc = document.getElementById('game-container')
  gc.classList.add('shake')
  setTimeout(() => gc.classList.remove('shake'), 200)
}

function explosion(x, y) {
  const boom = document.createElement('div')
  boom.style.position = 'absolute'
  boom.style.left = x + 'px'
  boom.style.top = y + 'px'
  boom.style.width = '40px'
  boom.style.height = '40px'
  boom.style.borderRadius = '50%'
  boom.style.background = 'orange'
  boom.style.boxShadow = '0 0 20px yellow'
  boom.style.opacity = '1'
  boom.style.transition = 'opacity 0.3s, transform 0.3s'
  boom.style.transform = 'scale(1)'
  boom.style.pointerEvents = 'none'

  document.getElementById('game-container').appendChild(boom)

  setTimeout(() => {
    boom.style.opacity = '0'
    boom.style.transform = 'scale(2)'
  }, 10)

  setTimeout(() => boom.remove(), 300)
}

function endGame() {
  if (!gameRunning) return
  gameRunning = false

  finalScoreEl.textContent = score

  if (score > highscore) {
    highscore = score
    localStorage.setItem('pyroclastia-highscore', highscore)
    highscoreEl.textContent = highscore
  }

  document.getElementById('game-over').style.display = 'flex'
}
