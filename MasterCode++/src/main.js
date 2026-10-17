import { Start } from './scenes/Start.js';
import { Game } from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'CodeMaster++',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#18212f',
    pixelArt: true,
    dom: { createContainer: true },
    scene: [Start, Game],
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};

new Phaser.Game(config);
