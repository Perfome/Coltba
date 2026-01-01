// ===========================================
// COLT 1V1 AIMBOT LAB - WORKING VERSION
// ===========================================

console.log('🚀 Colt Aimbot Lab başlatılıyor...');

// Global variables
let currentDifficulty = 'easy';
let gameActive = false;
let gameTime = 0;
let timerInterval = null;
let gameLoopId = null;

// DOM Elements cache
let dom = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initGame);

function initGame() {
    console.log('✅ DOM hazır, elementler bulunuyor...');
    
    // Cache DOM elements
    dom = {
        difficultySection: document.querySelector('.difficulty-section'),
        gameArea: document.getElementById('gameArea'),
        currentDifficulty: document.getElementById('currentDifficulty'),
        gameTime: document.getElementById('gameTime'),
        gameScore: document.getElementById('gameScore'),
        playerHealth: document.getElementById('playerHealth'),
        playerHealthText: document.getElementById('playerHealthText'),
        botHealth: document.getElementById('botHealth'),
        botHealthText: document.getElementById('botHealthText'),
        aimbotStatus: document.getElementById('aimbotStatus'),
        dodgeStatus: document.getElementById('dodgeStatus'),
        aimSensitivity: document.getElementById('aimSensitivity'),
        dodgeAggressiveness: document.getElementById('dodgeAggressiveness'),
        aimValue: document.getElementById('aimValue'),
        dodgeValue: document.getElementById('dodgeValue'),
        accuracyStat: document.getElementById('accuracyStat'),
        headshotsStat: document.getElementById('headshotsStat'),
        reactionStat: document.getElementById('reactionStat'),
        dodgeRateStat: document.getElementById('dodgeRateStat'),
        dodgedStat: document.getElementById('dodgedStat'),
        damageStat: document.getElementById('damageStat'),
        backgroundCanvas: document.getElementById('backgroundCanvas'),
        gameCanvas: document.getElementById('gameCanvas')
    };
    
    console.log('📋 DOM elementleri:', dom);
    
    // Bind difficulty buttons
    bindDifficultyButtons();
    
    // Bind control buttons
    bindControlButtons();
    
    // Bind sliders
    bindSliders();
    
    // Initialize background
    initBackground();
    
    console.log('🎮 Tüm bağlantılar kuruldu!');
}

// DIFFICULTY BUTTONS
function bindDifficultyButtons() {
    const buttons = {
        easy: document.querySelector('.easy-btn'),
        medium: document.querySelector('.medium-btn'),
        hard: document.querySelector('.hard-btn')
    };
    
    console.log('🎯 Butonlar bulundu:', buttons);
    
    Object.entries(buttons).forEach(([diff, btn]) => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log(`🎮 ${diff.toUpperCase()} seçildi!`);
                selectDifficulty(diff);
            });
            
            // Add visual feedback
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.3s ease';
        }
    });
}

// CONTROL BUTTONS
function bindControlButtons() {
    const aimBtn = document.querySelector('.aim-btn');
    const dodgeBtn = document.querySelector('.dodge-btn');
    const backBtn = document.querySelector('.back-btn');
    
    if (aimBtn) {
        aimBtn.addEventListener('click', toggleAimbot);
        aimBtn.style.cursor = 'pointer';
    }
    
    if (dodgeBtn) {
        dodgeBtn.addEventListener('click', toggleDodge);
        dodgeBtn.style.cursor = 'pointer';
    }
    
    if (backBtn) {
        backBtn.addEventListener('click', backToMenu);
        backBtn.style.cursor = 'pointer';
    }
}

// SLIDERS
function bindSliders() {
    if (dom.aimSensitivity) {
        dom.aimSensitivity.addEventListener('input', function(e) {
            dom.aimValue.textContent = `%${e.target.value}`;
        });
    }
    
    if (dom.dodgeAggressiveness) {
        dom.dodgeAggressiveness.addEventListener('input', function(e) {
            dom.dodgeValue.textContent = `%${e.target.value}`;
        });
    }
}

// SELECT DIFFICULTY
function selectDifficulty(difficulty) {
    console.log(`🎮 Zorluk seçimi: ${difficulty}`);
    
    currentDifficulty = difficulty;
    gameActive = true;
    
    // Update UI
    if (dom.currentDifficulty) {
        dom.currentDifficulty.textContent = `${difficulty.toUpperCase()} MOD`;
        dom.currentDifficulty.style.color = getDifficultyColor(difficulty);
    }
    
    // Show game area, hide menu
    if (dom.difficultySection) dom.difficultySection.style.display = 'none';
    if (dom.gameArea) dom.gameArea.style.display = 'block';
    
    // Start game
    startGame(difficulty);
}

function getDifficultyColor(diff) {
    const colors = {
        easy: '#00ff88',
        medium: '#ff9900',
        hard: '#ff3366'
    };
    return colors[diff] || '#00bfff';
}

// START GAME
function startGame(difficulty) {
    console.log(`🎮 Oyun başlatılıyor: ${difficulty}`);
    
    // Set health values
    const healthValues = {
        easy: { player: 5600, bot: 4200 },
        medium: { player: 5600, bot: 5600 },
        hard: { player: 5600, bot: 6160 }
    };
    
    const health = healthValues[difficulty] || healthValues.easy;
    
    // Update health bars
    updateHealthBars(health.player, 5600, health.bot, health.bot);
    
    // Start timer
    startTimer();
    
    // Reset stats
    resetStats();
    
    // Setup canvas
    if (dom.gameCanvas) {
        const ctx = dom.gameCanvas.getContext('2d');
        dom.gameCanvas.width = dom.gameCanvas.parentElement.clientWidth;
        dom.gameCanvas.height = 600;
        
        // Start game loop
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoopId = requestAnimationFrame(() => gameLoop(ctx, dom.gameCanvas, difficulty));
    }
}

// UPDATE HEALTH BARS
function updateHealthBars(playerHP, playerMax, botHP, botMax) {
    const playerPercent = (playerHP / playerMax) * 100;
    const botPercent = (botHP / botMax) * 100;
    
    if (dom.playerHealth) dom.playerHealth.style.width = `${playerPercent}%`;
    if (dom.botHealth) dom.botHealth.style.width = `${botPercent}%`;
    if (dom.playerHealthText) dom.playerHealthText.textContent = `${playerHP}/${playerMax}`;
    if (dom.botHealthText) dom.botHealthText.textContent = `${botHP}/${botMax}`;
    
    // Update colors
    updateHealthBarColors(playerPercent, botPercent);
}

function updateHealthBarColors(playerPercent, botPercent) {
    if (dom.playerHealth) {
        if (playerPercent < 30) {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #ff3366 0%, #ff9900 100%)';
        } else if (playerPercent < 60) {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #ff9900 0%, #ffff00 100%)';
        } else {
            dom.playerHealth.style.background = 'linear-gradient(135deg, #00bfff 0%, #9d4edd 100%)';
        }
    }
    
    if (dom.botHealth) {
        if (botPercent < 30) {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff0000 0%, #ff3366 100%)';
        } else if (botPercent < 60) {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff3366 0%, #ff9900 100%)';
        } else {
            dom.botHealth.style.background = 'linear-gradient(135deg, #ff3366 0%, #ff9900 100%)';
        }
    }
}

// TIMER
function startTimer() {
    gameTime = 0;
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        gameTime++;
        const minutes = Math.floor(gameTime / 60);
        const seconds = gameTime % 60;
        if (dom.gameTime) {
            dom.gameTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Update score every 5 seconds
        if (gameTime % 5 === 0 && dom.gameScore) {
            const score = parseInt(dom.gameScore.textContent) || 0;
            dom.gameScore.textContent = score + 10;
        }
    }, 1000);
}

// RESET STATS
function resetStats() {
    const stats = {
        'accuracyStat': '0%',
        'headshotsStat': '0',
        'reactionStat': '0ms',
        'dodgeRateStat': '0%',
        'dodgedStat': '0',
        'damageStat': '0',
        'gameScore': '0'
    };
    
    Object.entries(stats).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

// GAME LOOP
function gameLoop(ctx, canvas, difficulty) {
    if (!gameActive) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw game
    drawArena(ctx, canvas);
    drawPlayer(ctx, canvas);
    drawBot(ctx, canvas, difficulty);
    drawUI(ctx, canvas, difficulty);
    
    // Continue loop
    gameLoopId = requestAnimationFrame(() => gameLoop(ctx, canvas, difficulty));
}

// DRAW ARENA
function drawArena(ctx, canvas) {
    // Background
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Arena border
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
    
    // Grid lines
    ctx.strokeStyle = 'rgba(0, 191, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 50; x < canvas.width - 50; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 50);
        ctx.lineTo(x, canvas.height - 50);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 50; y < canvas.height - 50; y += 50) {
        ctx.beginPath();
        ctx.moveTo(50, y);
        ctx.lineTo(canvas.width - 50, y);
        ctx.stroke();
    }
}

// DRAW PLAYER
function drawPlayer(ctx, canvas) {
    const playerX = 200;
    const playerY = canvas.height / 2;
    
    // Player body
    ctx.fillStyle = '#00bfff';
    ctx.beginPath();
    ctx.arc(playerX, playerY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Player outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Gun
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(playerX + 25, playerY);
    ctx.lineTo(playerX + 60, playerY);
    ctx.stroke();
    
    // Aimbot indicator
    if (dom.aimbotStatus && dom.aimbotStatus.textContent.includes('AÇIK')) {
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(playerX, playerY, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(playerX - 15, playerY);
        ctx.lineTo(playerX + 15, playerY);
        ctx.moveTo(playerX, playerY - 15);
        ctx.lineTo(playerX, playerY + 15);
        ctx.stroke();
    }
}

// DRAW BOT
function drawBot(ctx, canvas, difficulty) {
    const time = Date.now() / 1000;
    const botX = canvas.width - 200;
    const botY = canvas.height / 2 + Math.sin(time) * 80;
    
    // Bot color based on difficulty
    let botColor = '#00ff88'; // Easy
    if (difficulty === 'medium') botColor = '#ff9900';
    if (difficulty === 'hard') botColor = '#ff3366';
    
    // Bot body
    ctx.fillStyle = botColor;
    ctx.beginPath();
    ctx.arc(botX, botY, 25, 0, Math.PI * 2);
    ctx.fill();
    
    // Bot outline
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Movement effect
    ctx.strokeStyle = botColor + '80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(botX, botY, 30 + Math.sin(time * 2) * 10, 0, Math.PI * 2);
    ctx.stroke();
    
    // Difficulty label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText(difficulty.toUpperCase(), botX, botY - 40);
    ctx.textAlign = 'left';
}

// DRAW UI
function drawUI(ctx, canvas, difficulty) {
    // Info panel
    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
    ctx.fillRect(20, 20, 250, 140);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px Orbitron';
    ctx.fillText('COLT 1V1 AIMBOT LAB', 30, 50);
    
    // Info
    ctx.font = '14px Arial';
    ctx.fillText(`Mod: ${difficulty.toUpperCase()}`, 30, 80);
    
    if (dom.gameTime) {
        ctx.fillText(`Süre: ${dom.gameTime.textContent}`, 30, 105);
    }
    
    if (dom.gameScore) {
        ctx.fillText(`Skor: ${dom.gameScore.textContent}`, 30, 130);
    }
    
    // Controls status
    if (dom.aimbotStatus) {
        const aimStatus = dom.aimbotStatus.textContent.includes('AÇIK') ? 'ON' : 'OFF';
        const aimColor = aimStatus === 'ON' ? '#00ff88' : '#ff6666';
        ctx.fillStyle = aimColor;
        ctx.fillText(`Aimbot: ${aimStatus}`, 30, 155);
    }
}

// CONTROL FUNCTIONS
function toggleAimbot() {
    if (!dom.aimbotStatus) return;
    
    const isOn = dom.aimbotStatus.textContent.includes('AÇIK');
    dom.aimbotStatus.textContent = `Aimbot: ${isOn ? 'KAPALI' : 'AÇIK'}`;
    dom.aimbotStatus.style.color = isOn ? '#ff6666' : '#00ff88';
    
    console.log(`🎯 Aimbot ${isOn ? 'kapatıldı' : 'açıldı'}`);
}

function toggleDodge() {
    if (!dom.dodgeStatus) return;
    
    const isOn = dom.dodgeStatus.textContent.includes('AÇIK');
    dom.dodgeStatus.textContent = `Dodge: ${isOn ? 'KAPALI' : 'AÇIK'}`;
    dom.dodgeStatus.style.color = isOn ? '#ff6666' : '#00ff88';
    
    console.log(`🛡️ Dodge ${isOn ? 'kapatıldı' : 'açıldı'}`);
}

function backToMenu() {
    console.log('🔙 Menüye dönülüyor...');
    
    gameActive = false;
    
    // Clear intervals
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    
    // Show menu, hide game
    if (dom.difficultySection) dom.difficultySection.style.display = 'block';
    if (dom.gameArea) dom.gameArea.style.display = 'none';
}

// BACKGROUND ANIMATION
function initBackground() {
    if (!dom.backgroundCanvas) return;
    
    const ctx = dom.backgroundCanvas.getContext('2d');
    
    function resize() {
        dom.backgroundCanvas.width = window.innerWidth;
        dom.backgroundCanvas.height = window.innerHeight;
    }
    
    function animate() {
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, dom.backgroundCanvas.width, dom.backgroundCanvas.height);
        
        // Stars
        const time = Date.now() / 1000;
        
        for (let i = 0; i < 100; i++) {
            const x = (time * 20 + i * 100) % dom.backgroundCanvas.width;
            const y = (Math.sin(time * 0.5 + i) * 100 + i * 50) % dom.backgroundCanvas.height;
            const size = Math.sin(time + i) * 1.5 + 1;
            const alpha = Math.sin(time * 0.3 + i) * 0.3 + 0.3;
            
            ctx.fillStyle = `rgba(0, 191, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        requestAnimationFrame(animate);
    }
    
    window.addEventListener('resize', resize);
    resize();
    animate();
}

// ERROR HANDLING
window.addEventListener('error', function(e) {
    console.error('❌ JavaScript hatası:', e.error);
    alert('Bir hata oluştu! Console\'u kontrol et (F12)');
});

console.log('🎮 Colt Aimbot Lab hazır! Butonlara tıkla!');
