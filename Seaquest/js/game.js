let submarine, torpedos, enemies, powerUps;
let cursors, fireButton;
let lives = 5;
let specialAttacks = 3;
let score = 0;
let scoreText, livesText, specialText;
let lastFired = 0;
let isShieldActive = false;

function preload() {
    this.load.image('background', 'assets/images/background.png');
    this.load.image('submarine', 'assets/images/submarine.png');
    this.load.image('enemySub', 'assets/images/enemy_sub.png');
    this.load.image('fish', 'assets/images/fish.png');
    this.load.image('torpedo', 'assets/images/torpedo.png');
    this.load.image('explosion', 'assets/images/explosion.png');
    this.load.image('powerup', 'assets/images/powerup.png');
    this.load.audio('shoot', 'assets/sounds/shoot.wav');
    this.load.audio('explosion', 'assets/sounds/explosion.wav');
    this.load.audio('powerup', 'assets/sounds/powerup.wav');
}

function create() {
    // 1. Fondo
    this.add.image(400, 300, 'background');

    // 2. Submarino del jugador
    submarine = this.physics.add.sprite(400, 500, 'submarine');
    submarine.setCollideWorldBounds(true);

    // 3. Grupo de torpedos
    torpedos = this.physics.add.group();

    // 4. Grupo de enemigos
    enemies = this.physics.add.group();
    spawnEnemies(this);

    // 5. Power-ups
    powerUps = this.physics.add.group();

    // 6. Controles
    cursors = this.input.keyboard.createCursorKeys();
    fireButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 7. Textos (puntuación, vidas, ataques especiales)
    scoreText = this.add.text(16, 16, 'Puntos: 0', { fontSize: '24px', fill: '#fff' });
    livesText = this.add.text(16, 50, 'Vidas: 5', { fontSize: '24px', fill: '#fff' });
    specialText = this.add.text(16, 84, 'Ataques Especiales: 3', { fontSize: '24px', fill: '#fff' });

    // 8. Colisiones
    this.physics.add.collider(torpedos, enemies, hitEnemy, null, this);
    this.physics.add.collider(submarine, enemies, hitSubmarine, null, this);
    this.physics.add.overlap(submarine, powerUps, collectPowerUp, null, this);
}

function update() {
    // Movimiento del submarino (8 direcciones)
    submarine.setVelocity(0);

    if (cursors.left.isDown) submarine.setVelocityX(-200);
    if (cursors.right.isDown) submarine.setVelocityX(200);
    if (cursors.up.isDown) submarine.setVelocityY(-200);
    if (cursors.down.isDown) submarine.setVelocityY(200);

    // Disparar torpedos (con delay)
    if (fireButton.isDown && this.time.now > lastFired) {
        shootTorpedo(this);
        lastFired = this.time.now + 300; // Delay de 300ms
    }

    // Usar ataque especial (tecla "E")
    if (this.input.keyboard.checkDown(Phaser.Input.Keyboard.KeyCodes.E, 500)) {
        useSpecialAttack(this);
    }
}

function shootTorpedo(scene) {
    const torpedo = torpedos.create(submarine.x, submarine.y - 20, 'torpedo');
    torpedo.setVelocityY(-300);
    scene.sound.play('shoot');
}

function spawnEnemies(scene) {
    const enemyTypes = ['enemySub', 'fish'];
    const randomX = Phaser.Math.Between(50, 750);
    const randomType = Phaser.Math.RND.pick(enemyTypes);

    const enemy = enemies.create(randomX, -50, randomType);
    enemy.setVelocityY(Phaser.Math.Between(50, 150));

    // Generar enemigos cada 2 segundos
    scene.time.addEvent({
        delay: 2000,
        callback: spawnEnemies,
        callbackScope: scene,
        loop: true
    });
}

function hitEnemy(torpedo, enemy) {
    torpedo.destroy();
    enemy.destroy();
    score += 10;
    scoreText.setText(`Puntos: ${score}`);
    this.sound.play('explosion');
}

function hitSubmarine(submarine, enemy) {
    if (!isShieldActive) {
        lives--;
        livesText.setText(`Vidas: ${lives}`);
        enemy.destroy();
        if (lives <= 0) gameOver(this);
    }
}

function collectPowerUp(submarine, powerUp) {
    powerUp.destroy();
    specialAttacks++;
    specialText.setText(`Ataques Especiales: ${specialAttacks}`);
    this.sound.play('powerup');
}
function useSpecialAttack(scene) {
    if (specialAttacks > 0) {
        specialAttacks--;
        specialText.setText(`Ataques Especiales: ${specialAttacks}`);

        // 1. Bomba de profundidad (daño en área)
        if (specialAttacks === 2) {
            enemies.getChildren().forEach(enemy => {
                if (enemy.y > submarine.y - 100) {
                    enemy.destroy();
                    score += 15;
                }
            });
        }
        // 2. Ráfaga de torpedos (3 disparos seguidos)
        else if (specialAttacks === 1) {
            for (let i = 0; i < 3; i++) {
                scene.time.delayedCall(i * 200, () => shootTorpedo(scene));
            }
        }
        // 3. Escudo temporal (3 segundos de invencibilidad)
        else if (specialAttacks === 0) {
            isShieldActive = true;
            submarine.setTint(0x00ff00); // Verde = escudo activo
            scene.time.delayedCall(3000, () => {
                isShieldActive = false;
                submarine.clearTint();
            });
        }
    }
}

function gameOver(scene) {
    scene.physics.pause();
    submarine.setTint(0xff0000); // Rojo = destruido
    scene.add.text(300, 300, 'GAME OVER', { fontSize: '48px', fill: '#ff0000' });
}






