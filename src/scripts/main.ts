import Phaser from 'phaser';
import { ScenePreloadAssets } from './Common/Scenes/ScenePreloadAssets';
import { CST } from './Common/CST';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: CST.GAME.WIDTH,
    height: CST.GAME.HEIGHT,
    dom: { createContainer: true },
    scene: [ScenePreloadAssets],
    render: { pixelArt: false, transparent: true },
    physics: { 
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: CST.PHYSIC.DEBUG
        }
    },
    plugins: {
        scene: [
            {key: 'rexUI',  plugin: UIPlugin, mapping: 'rexUI'},
        ]
    }
});