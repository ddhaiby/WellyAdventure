import Phaser from 'phaser';
import { ScenePreloadAssets } from "./Scenes/ScenePreloadAssets";
import { CST } from './CST';

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: 800,
    height: 600,
    dom: { createContainer: true },
    scene: [ScenePreloadAssets],
    render: { pixelArt: false, transparent: true },
    physics: { 
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: CST.PHYSIC.DEBUG
        }
    }
});