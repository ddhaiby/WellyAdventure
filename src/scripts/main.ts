import Phaser from 'phaser';
import { ScenePreloadAssets } from './TowerDefenseMode/Scenes/WELLY_ScenePreloadAssets';
import { WELLY_CST } from './WELLY_CST';
import UIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import OutlinePipelinePlugin from 'phaser3-rex-plugins/plugins/outlinepipeline-plugin.js';
import PathFollowerPlugin from 'phaser3-rex-plugins/plugins/pathfollower-plugin.js';
import WebFontLoaderPlugin from 'phaser3-rex-plugins/plugins/webfontloader-plugin';

document.body.style.margin = "0";
document.body.style.padding = "0";
document.body.style.overflow = "hidden";

new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    width: WELLY_CST.GAME.WIDTH,
    height: WELLY_CST.GAME.HEIGHT,
    dom: { createContainer: true },
    scene: [ScenePreloadAssets],
    render: { pixelArt: false, transparent: true },
    backgroundColor: "#ffffff",
    physics: { 
        default: "arcade",
        arcade: {
            gravity: {y: 0},
            debug: WELLY_CST.PHYSIC.DEBUG
        }
    },
    plugins: {
        global: [
            { key: 'rexWebFontLoader', plugin: WebFontLoaderPlugin, start: true },
            { key: "rexOutlinePipeline", plugin: OutlinePipelinePlugin, start: true },
            { key: "rexPathFollower", plugin: PathFollowerPlugin, start: true }
        ],
        scene: [
            {key: "rexUI",  plugin: UIPlugin, mapping: "rexUI"}
        ]
    }
});