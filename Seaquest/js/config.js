const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000033',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Sin gravedad (juego submarino)
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