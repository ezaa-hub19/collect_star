const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 400 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let stars;
let platforms;
let enemies;
let score = 0;
let lives = 3;
let level = 1;
let scoreText;
let livesText;
let levelText;
let gameOverText;
let nextLevelText;
let cursors;
let wasdKeys;
let gameState = 'playing';

// Collider references untuk cleanup
let colliders = [];

// Scene reference untuk restart
let currentScene;

function preload() {
    // Sprites akan dibuat dalam create function
}

function createSprites() {
    // Platform sprite (green rectangle)
    let platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x228B22);
    platformGraphics.fillRect(0, 0, 400, 32);
    platformGraphics.generateTexture('ground', 400, 32);
    platformGraphics.destroy();
    
    // Star sprite (yellow circle with glow)
    let starGraphics = this.add.graphics();
    starGraphics.fillStyle(0xFFD700);
    starGraphics.fillCircle(16, 16, 12);
    starGraphics.lineStyle(2, 0xFFA500);
    starGraphics.strokeCircle(16, 16, 12);
    starGraphics.generateTexture('star', 32, 32);
    starGraphics.destroy();
    
    // Player sprite (blue rectangle with border)
    let playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x4169E1);
    playerGraphics.fillRect(2, 2, 28, 44);
    playerGraphics.lineStyle(2, 0x191970);
    playerGraphics.strokeRect(2, 2, 28, 44);
    playerGraphics.generateTexture('dude', 32, 48);
    playerGraphics.destroy();
}

function create() {
    // Store scene reference for restart
    currentScene = this;
    
    // Background (sky blue)
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB);
    
    // Create sprites using graphics
    createSprites.call(this);
    
    // Create platforms based on level
    createLevel.call(this);
    
    // Player
    player = this.physics.add.sprite(80, 400, 'dude');
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);
    player.setSize(28, 44);
    
    // Create stars
    createStars.call(this);
    
    // Create enemies
    createEnemies.call(this);
    
    // UI Text with background
    createUI.call(this);
    
    // Input - Arrow keys
    cursors = this.input.keyboard.createCursorKeys();
    
    // WASD keys for alternative control
    wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
    
    // Setup colliders
    setupColliders.call(this);
    
    // Restart key - improved with better handling
    this.input.keyboard.on('keydown-SPACE', function (event) {
        event.preventDefault(); // Prevent default space behavior
        if (gameState === 'gameOver') {
            restartGame.call(this);
        } else if (gameState === 'levelComplete') {
            nextLevel.call(this);
        }
    }, this);
    
    // Alternative restart with R key
    this.input.keyboard.on('keydown-R', function (event) {
        if (gameState === 'gameOver' || gameState === 'playing') {
            restartGame.call(this);
        }
    }, this);
}

function setupColliders() {
    // Clear existing colliders
    colliders.forEach(collider => {
        if (collider && collider.destroy) {
            collider.destroy();
        }
    });
    colliders = [];
    
    // Create new colliders and store references
    if (platforms && player) {
        colliders.push(this.physics.add.collider(player, platforms));
    }
    if (platforms && stars) {
        colliders.push(this.physics.add.collider(stars, platforms));
    }
    if (platforms && enemies) {
        colliders.push(this.physics.add.collider(enemies, platforms));
    }
    if (player && stars) {
        colliders.push(this.physics.add.overlap(player, stars, collectStar, null, this));
    }
    if (player && enemies) {
        colliders.push(this.physics.add.overlap(player, enemies, hitEnemy, null, this));
    }
}

function createLevel() {
    // Clear existing platforms
    if (platforms) {
        platforms.clear(true, true);
    }
    
    platforms = this.physics.add.staticGroup();
    
    // Different platform layouts for each level
    switch(level) {
        case 1:
            // Ground platforms
            platforms.create(400, 568, 'ground').setScale(1).refreshBody();
            
            // Lower level platforms
            platforms.create(150, 450, 'ground').setScale(0.4).refreshBody();
            platforms.create(650, 450, 'ground').setScale(0.4).refreshBody();
            
            // Mid level platforms
            platforms.create(10, 350, 'ground').setScale(0.3).refreshBody();
            platforms.create(500, 350, 'ground').setScale(0.3).refreshBody();
            platforms.create(250, 350, 'ground').setScale(0.3).refreshBody();
            
            // Upper level platforms
            platforms.create(100, 250, 'ground').setScale(0.3).refreshBody();
            platforms.create(400, 200, 'ground').setScale(0.4).refreshBody();
            platforms.create(700, 120, 'ground').setScale(0.3).refreshBody();
            break;
            
        case 2:
            platforms.create(400, 568, 'ground').setScale(1).refreshBody();
            
            // More complex layout
            platforms.create(100, 480, 'ground').setScale(0.3).refreshBody();
            platforms.create(300, 420, 'ground').setScale(0.3).refreshBody();
            platforms.create(500, 480, 'ground').setScale(0.3).refreshBody();
            platforms.create(700, 420, 'ground').setScale(0.3).refreshBody();
            
            platforms.create(200, 320, 'ground').setScale(0.3).refreshBody();
            platforms.create(600, 320, 'ground').setScale(0.3).refreshBody();
            
            platforms.create(80, 220, 'ground').setScale(0.25).refreshBody();
            platforms.create(350, 180, 'ground').setScale(0.4).refreshBody();
            platforms.create(720, 220, 'ground').setScale(0.25).refreshBody();
            
            platforms.create(150, 120, 'ground').setScale(0.3).refreshBody();
            platforms.create(650, 120, 'ground').setScale(0.3).refreshBody();
            break;
            
        case 3:
            platforms.create(400, 568, 'ground').setScale(1).refreshBody();
            
            // Zigzag pattern
            platforms.create(120, 480, 'ground').setScale(0.25).refreshBody();
            platforms.create(280, 420, 'ground').setScale(0.25).refreshBody();
            platforms.create(440, 360, 'ground').setScale(0.25).refreshBody();
            platforms.create(600, 300, 'ground').setScale(0.25).refreshBody();
            platforms.create(480, 240, 'ground').setScale(0.25).refreshBody();
            platforms.create(310, 180, 'ground').setScale(0.25).refreshBody();
            platforms.create(680, 150, 'ground').setScale(0.25).refreshBody();
            platforms.create(160, 120, 'ground').setScale(0.25).refreshBody();
            
            // Additional scattered platforms
            platforms.create(50, 350, 'ground').setScale(0.2).refreshBody();
            platforms.create(750, 450, 'ground').setScale(0.2).refreshBody();
            platforms.create(550, 500, 'ground').setScale(0.2).refreshBody();
            break;
            
        default:
            // Random level generation
            platforms.create(400, 568, 'ground').setScale(1).refreshBody();
            
            let platformCount = Math.min(level + 8, 20);
            for (let i = 0; i < platformCount; i++) {
                let x = Phaser.Math.Between(60, 740);
                let y = Phaser.Math.Between(120, 500);
                let scale = Phaser.Math.FloatBetween(0.2, 0.5);
                platforms.create(x, y, 'ground').setScale(scale).refreshBody();
            }
    }
}

function createStars() {
    if (stars) {
        stars.clear(true, true);
    }
    
    stars = this.physics.add.group();
    
    // More stars for higher levels
    let starCount = 10 + (level * 3);
    for (let i = 0; i < starCount; i++) {
        let x = Phaser.Math.Between(30, 770);
        let y = Phaser.Math.Between(0, 150);
        let star = stars.create(x, y, 'star');
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setBounceX(Phaser.Math.FloatBetween(0.1, 0.3));
        star.setCollideWorldBounds(true);
    }
}

function createEnemies() {
    if (enemies) {
        enemies.clear(true, true);
    }
    
    enemies = this.physics.add.group();
    
    // More enemies for higher levels
    let enemyCount = Math.min(level + 1, 6);
    for (let i = 0; i < enemyCount; i++) {
        let x = Phaser.Math.Between(100, 700);
        let y = 200;
        
        // Create enemy using player sprite but tinted red
        let enemy = enemies.create(x, y, 'dude');
        enemy.setBounce(0.8);
        enemy.setCollideWorldBounds(true);
        enemy.setVelocity(Phaser.Math.Between(-120, 120), 0);
        enemy.setTint(0xff0000);
        enemy.setScale(0.7);
        enemy.setSize(28, 44);
    }
}

function createUI() {
    // Background for Score
    let scoreBg = this.add.graphics();
    scoreBg.fillStyle(0x000000, 0.7);
    scoreBg.fillRoundedRect(10, 10, 160, 45, 8);
    
    scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#00ff00',
        strokeThickness: 2
    });
    
    // Background for Lives
    let livesBg = this.add.graphics();
    livesBg.fillStyle(0x000000, 0.7);
    livesBg.fillRoundedRect(10, 65, 110, 40, 9);
    
    livesText = this.add.text(20, 72, 'Lives: 3', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#ff0000',
        strokeThickness: 2
    });
    
    // Background for Level
    let levelBg = this.add.graphics();
    levelBg.fillStyle(0x000000, 0.7);
    levelBg.fillRoundedRect(630, 15, 140, 40, 8);
    
    levelText = this.add.text(650, 20, 'Level: 1', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#ffff00',
        strokeThickness: 2
    });
    
    // Controls instruction
    this.add.text(10, 110, 'Arrow Keys/WASD: Move | SPACE: Action | R: Restart', {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: { x: 8, y: 4 }
    });
}

function update() {
    if (gameState !== 'playing') return;
    
    // Check if player fell off the world
    if (player && player.y > 650) {
        playerDeath.call(this);
        return;
    }
    
    // Player movement - Arrow keys OR WASD
    if (player && player.body) {
        let isMovingLeft = cursors.left.isDown || wasdKeys.A.isDown;
        let isMovingRight = cursors.right.isDown || wasdKeys.D.isDown;
        let isJumping = cursors.up.isDown || wasdKeys.W.isDown;
        
        if (isMovingLeft) {
            player.setVelocityX(-180);
        }
        else if (isMovingRight) {
            player.setVelocityX(180);
        }
        else {
            player.setVelocityX(0);
        }
        
        // Jumping - only when touching ground
        if (isJumping && player.body.touching.down) {
            player.setVelocityY(-380);
        }
        
        // Visual feedback for movement
        if (isMovingLeft || isMovingRight) {
            player.setTint(0x6495ED); // Lighter blue when moving
        } else {
            player.setTint(0x4169E1); // Normal blue when idle
        }
    }
    
    // Enemy AI - improved bouncing
    if (enemies && enemies.children) {
        enemies.children.entries.forEach(function(enemy) {
            if (enemy.body && enemy.body.touching) {
                if (enemy.body.touching.left || enemy.body.touching.right) {
                    enemy.body.setVelocityX(-enemy.body.velocity.x);
                }
                
                // Random direction change occasionally
                if (Phaser.Math.Between(1, 1000) < 5) {
                    enemy.setVelocityX(Phaser.Math.Between(-120, 120));
                }
            }
        });
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10 * level;
    scoreText.setText('Score: ' + score);
    
    // Visual effect for collecting star
    let particles = currentScene.add.particles(star.x, star.y, 'star', {
        speed: { min: 50, max: 100 },
        scale: { start: 0.3, end: 0 },
        lifespan: 300,
        quantity: 5
    });
    
    currentScene.time.delayedCall(300, () => {
        if (particles) particles.destroy();
    });
    
    // Check if all stars collected
    if (stars.countActive(true) === 0) {
        levelComplete.call(currentScene);
    }
}

function hitEnemy(player, enemy) {
    playerDeath.call(currentScene);
}

function playerDeath() {
    lives--;
    if (livesText) {
        livesText.setText('Lives: ' + lives);
    }
    
    // Flash effect
    if (player) {
        player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            if (player) player.setTint(0x4169E1);
        });
    }
    
    if (lives <= 0) {
        gameOver.call(this);
    } else {
        // Respawn player
        if (player) {
            player.setPosition(80, 400);
            player.setVelocity(0, 0);
            
            // Invincibility frames
            this.tweens.add({
                targets: player,
                alpha: 0.3,
                duration: 100,
                yoyo: true,
                repeat: 10,
                onComplete: () => {
                    if (player) player.setAlpha(1);
                }
            });
        }
    }
}

function levelComplete() {
    gameState = 'levelComplete';
    
    // Background for level complete
    let completeBg = this.add.graphics();
    completeBg.fillStyle(0x000000, 0.8);
    completeBg.fillRect(0, 0, 800, 600);
    completeBg.setDepth(100);
    
    nextLevelText = this.add.text(400, 250, 'LEVEL COMPLETE!', {
        fontSize: '64px',
        color: '#00ff00',
        fontFamily: 'Impact',
        stroke: '#ffffff',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(101);
    
    let instructionText = this.add.text(400, 320, 'Press SPACE for next level', {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);
    
    // Bonus points for remaining lives
    let bonus = lives * 100;
    score += bonus;
    if (scoreText) {
        scoreText.setText('Score: ' + score);
    }
    
    let bonusText = this.add.text(400, 380, `Bonus: ${bonus} points`, {
        fontSize: '24px',
        color: '#ffff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);
    
    // Store references to destroy later
    this.levelCompleteElements = [completeBg, instructionText, bonusText];
    
    // Celebration effect
    this.tweens.add({
        targets: nextLevelText,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function nextLevel() {
    level++;
    if (levelText) {
        levelText.setText('Level: ' + level);
    }
    gameState = 'playing';
    
    // Clear level complete UI elements
    if (nextLevelText) {
        nextLevelText.destroy();
        nextLevelText = null;
    }
    
    // Destroy all level complete elements
    if (this.levelCompleteElements) {
        this.levelCompleteElements.forEach(element => {
            if (element && element.destroy) element.destroy();
        });
        this.levelCompleteElements = null;
    }
    
    // Stop all tweens
    this.tweens.killAll();
    
    // Reset player position and state
    if (player) {
        player.setPosition(80, 400);
        player.setVelocity(0, 0);
        player.setAlpha(1);
        player.setTint(0x4169E1);
    }
    
    // Create new level
    createLevel.call(this);
    createStars.call(this);
    createEnemies.call(this);
    
    // Setup colliders for new level
    setupColliders.call(this);
}

function gameOver() {
    gameState = 'gameOver';
    
    // Stop player
    if (player) {
        player.setVelocity(0, 0);
    }
    
    // Background for game over
    let gameOverBg = this.add.graphics();
    gameOverBg.fillStyle(0x000000, 0.9);
    gameOverBg.fillRect(0, 0, 800, 600);
    gameOverBg.setDepth(100);
    
    gameOverText = this.add.text(400, 200, 'GAME OVER', {
        fontSize: '80px',
        color: '#ff0000',
        fontFamily: 'Impact',
        stroke: '#ffffff',
        strokeThickness: 4,
        shadow: {
            offsetX: 4,
            offsetY: 4,
            color: '#000000',
            blur: 8,
            fill: true
        }
    }).setOrigin(0.5).setDepth(101);
    
    let finalScoreText = this.add.text(400, 300, `Final Score: ${score}`, {
        fontSize: '48px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#ffff00',
        strokeThickness: 2
    }).setOrigin(0.5).setDepth(101);
    
    let levelReachedText = this.add.text(400, 360, `Level Reached: ${level}`, {
        fontSize: '36px',
        color: '#ffffff',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);
    
    let restartText = this.add.text(400, 450, 'Press SPACE or R to restart', {
        fontSize: '32px',
        color: '#00ff00',
        fontFamily: 'Arial'
    }).setOrigin(0.5).setDepth(101);
    
    // Store references for cleanup
    this.gameOverElements = [gameOverBg, finalScoreText, levelReachedText, restartText];
    
    // Pulse animation
    this.tweens.add({
        targets: gameOverText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}

function restartGame() {
    console.log('Restarting game...'); // Debug log
    
    // Reset game variables
    score = 0;
    lives = 3;
    level = 1;
    gameState = 'playing';
    
    // Update UI
    if (scoreText) scoreText.setText('Score: 0');
    if (livesText) livesText.setText('Lives: 3');
    if (levelText) levelText.setText('Level: 1');
    
    // Clear game over UI elements
    if (gameOverText) {
        gameOverText.destroy();
        gameOverText = null;
    }
    
    // Destroy all game over elements
    if (this.gameOverElements) {
        this.gameOverElements.forEach(element => {
            if (element && element.destroy) element.destroy();
        });
        this.gameOverElements = null;
    }
    
    // Clear level complete elements if any
    if (nextLevelText) {
        nextLevelText.destroy();
        nextLevelText = null;
    }
    
    if (this.levelCompleteElements) {
        this.levelCompleteElements.forEach(element => {
            if (element && element.destroy) element.destroy();
        });
        this.levelCompleteElements = null;
    }
    
    // Stop all tweens
    this.tweens.killAll();
    
    // Reset player
    if (player) {
        player.setPosition(80, 400);
        player.setVelocity(0, 0);
        player.setAlpha(1);
        player.setTint(0x4169E1);
    }
    
    // Recreate level
    createLevel.call(this);
    createStars.call(this);
    createEnemies.call(this);
    
    // Setup colliders for new game
    setupColliders.call(this);
    
    console.log('Game restarted successfully!'); // Debug log
}