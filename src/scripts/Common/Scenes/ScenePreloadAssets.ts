import { CST } from "../CST";
import { Welly_Scene } from "./WELLY_Scene";
import { SceneExplorationGame } from "../../ExplorationMode/Scenes/SceneExplorationGame";
import { SceneExplorationGameUI } from "../../ExplorationMode/Scenes/SceneExplorationGameUI";
import { SceneTowerDefense } from "../../TowerDefenseMode/Scenes/SceneTowerDefense";
import { SceneTowerDefenseUI } from "../../TowerDefenseMode/Scenes/SceneTowerDefenseUI";

export class ScenePreloadAssets extends Welly_Scene
{
    constructor()
    {
        super({key: CST.SCENES.PRELOAD_ASSETS});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init() : void
    {
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload() : void
    {
        this.preloadCharacters();
        this.preloadCity();
        this.preloadTowerDefenseAssets();

        this.load.setPath("./assets/data/");
        this.load.json("dialogues", "dialogues.json");
        this.load.json("monstersData", "monstersData.json");
        this.load.json("waveData", "waveData.json");
    }

    private preloadCharacters(): void
    {
        this.load.setPath("./assets/characters/");
        this.load.spritesheet("player", "player.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("Amalia", "Amalia.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyRed", "wellyRed.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyWhite", "wellyWhite.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyItaly", "wellyItaly.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("boss1", "boss1.png", { frameWidth: 128, frameHeight: 128 });
    }

    private preloadCity(): void
    {
        this.load.setPath("./assets/maps/");
        this.load.image("assetCity", "assetCity.png");
        this.load.tilemapTiledJSON("cityMap", "cityMap.json");
    }

    private preloadTowerDefenseAssets(): void
    {
        this.load.setPath("./assets/maps/");
        this.load.image("assetTowerDefenseMap", "assetTowerDefenseMap.png");
        this.load.tilemapTiledJSON("towerDefenseMap", "towerDefenseMap.json");

        this.load.setPath("./assets/turrets/");
        this.load.image("emptyTurret", "emptyTurret.png");
        this.load.image("canon", "canon.png");
        this.load.image("bullet", "bullet.png");

        this.load.setPath("./assets/HUD/");
        this.load.image("buttonConnectNormal", "buttonConnectNormal.png");
    }

    // Create
    ////////////////////////////////////////////////////////////////////////
  
    public create() : void
    {
        // const sceneUI = this.scene.add(CST.SCENES.EXPLORATION_GAME_UI, SceneExplorationGameUI, true, undefined) as SceneExplorationGameUI;
        // this.scene.add(CST.SCENES.EXPLORATION_GAME, SceneExplorationGame, true, undefined);
        // sceneUI.scene.bringToTop();

        const sceneUI = this.scene.add(CST.SCENES.TOWER_DEFENSE_UI, SceneTowerDefenseUI, true, undefined) as SceneTowerDefenseUI;
        this.scene.add(CST.SCENES.TOWER_DEFENSE, SceneTowerDefense, true, undefined);
        sceneUI.scene.bringToTop();

        this.scene.remove(CST.SCENES.PRELOAD_ASSETS);
    }
}