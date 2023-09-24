import Phaser from 'phaser';
import { ScenePreloadAssets } from './Common/Scenes/ScenePreloadAssets';
import { CST } from './Common/CST';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';

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
    render: { pixelArt: false, transparent: false },
    backgroundColor: "#f7e6e6",
    physics: { 
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: CST.PHYSIC.DEBUG
        }
    },
    plugins: {
        global: [
            { key: 'rexOutlinePipeline', plugin: OutlinePipelinePlugin, start: true },
        ],
        scene: [
            {key: 'rexUI',  plugin: UIPlugin, mapping: 'rexUI'}
        ]
    }
});