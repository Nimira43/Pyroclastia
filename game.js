let player
let scoreEl, livesEl, finalScoreEl, highscoreEl
let score = 0
let lives = 3
let fireballSpeed = 4
let gameRunning = false
let highscore = 0
let fireballs = []
let bullets = []
let fireballSpawnRate = 800 
let lastSpawn = 0

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
    if (e.code === 'Space' && gameRunning) {
      shoot()
    }
  })
}

function startGame() {
  score = 0
  lives = 3
  fireballSpeed = 6
  fireballSpawnRate = 800
  fireballs.forEach(fb => fb.remove())
  bullets.forEach(b => b.remove())
  fireballs = []
  bullets = []
  gameRunning = true
  scoreEl.textContent = score
  livesEl.textContent = lives

  document.getElementById('start-screen').style.display = 'none'
  document.getElementById('game-over').style.display = 'none'

  lastSpawn = Date.now()
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
  fb.style.left = Math.random() * (window.innerWidth - 40) + 'px'
  fb.style.top = '-40px'

  document.getElementById('fireballs').appendChild(fb)
  fireballs.push(fb)
}

function shoot() {
  const bullet = document.createElement('div')
  bullet.classList.add('bullet')

  const playerRect = player.getBoundingClientRect()

  bullet.style.left = playerRect.left + playerRect.width / 2 - 3 + 'px'
  bullet.style.top = playerRect.top - 20 + 'px'

  document.getElementById('bullets').appendChild(bullet)
  bullets.push(bullet)
}

function gameLoop() {
  if (!gameRunning) return

  const now = Date.now()
  if (now - lastSpawn > fireballSpawnRate) {
    spawnFireball()
    lastSpawn = now
    if (fireballSpawnRate > 200) fireballSpawnRate -= 20
    fireballSpeed += 0.05
  }

  updateFireballs()
  updateBullets()

  requestAnimationFrame(gameLoop)
}

function updateFireballs() {
  fireballs.forEach((fb, index) => {
    fb.style.top = fb.offsetTop + fireballSpeed + 'px'

    if (isColliding(player, fb)) {
      lives--
      livesEl.textContent = lives
      screenShake()
      explosion(fb.offsetLeft, fb.offsetTop)
      fb.remove()
      fireballs.splice(index, 1)

      if (lives <= 0) {
        endGame()
        return
      }
    }

    if (fb.offsetTop > window.innerHeight) {
      fb.remove()
      fireballs.splice(index, 1)
      score++
      scoreEl.textContent = score
    }
  })
}

function updateBullets() {
  bullets.forEach((b, bIndex) => {
    b.style.top = b.offsetTop - 10 + 'px'

    if (b.offsetTop < -20) {
      b.remove()
      bullets.splice(bIndex, 1)
      return
    }

    fireballs.forEach((fb, fIndex) => {
      if (isColliding(b, fb)) {
        explosion(fb.offsetLeft, fb.offsetTop)

        fb.remove()
        fireballs.splice(fIndex, 1)

        b.remove()
        bullets.splice(bIndex, 1)

        score += 5
        scoreEl.textContent = score
      }
    })
  })
}

function isColliding(a, b) {
  const aRect = a.getBoundingClientRect()
  const bRect = b.getBoundingClientRect()

  return !(
    aRect.bottom < bRect.top ||
    aRect.top > bRect.bottom ||
    aRect.right < bRect.left ||
    aRect.left > bRect.right
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
