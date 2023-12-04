import { WELLY_CST } from "../../WELLY_CST";
import { WELLY_BaseScene } from "../../Common/Scenes/WELLY_BaseScene";
import { WELLY_SceneTowerDefense } from "./WELLY_SceneTowerDefense";
import { WELLY_SceneTowerDefenseUI } from "./WELLY_SceneTowerDefenseUI";
import { WELLY_LoadingScreen } from "../../Common/HUD/WELLY_LoadingScreen";
import { WELLY_GameAnalytics } from "../Analytics/WELLY_GameAnalytics";

export class ScenePreloadAssets extends WELLY_BaseScene
{
    constructor()
    {
        super({key: WELLY_CST.SCENES.PRELOAD_ASSETS});
    }

    // Init
    ////////////////////////////////////////////////////////////////////////

    public init() : void
    {
        WELLY_GameAnalytics.init();
    }

    // Preload
    ////////////////////////////////////////////////////////////////////////

    public preload() : void
    {
        this.preloadSplashScreen();
    }

    private preloadSplashScreen(): void
    {
        this.load.setPath("./assets/loadingScreen/");
        this.load.spritesheet("loadingSpriteSheet", "loadingSpriteSheet.png", { frameWidth: 191, frameHeight: 201 });
    }

    // Load - Post create
    ////////////////////////////////////////////////////////////////////////

    private loadAssets(): void
    {
        this.loadAudio();
        this.loadCharacters();
        this.loadTowerDefenseAssets();
        this.loadWellyBonus();

        this.load.setPath("./assets/data/");
        this.load.json("dialogues", "dialogues.json");
        this.load.json("monstersData", "monstersData.json");
        this.load.json("turretsData", "turretsData.json");
        this.load.json("waveData", "waveData.json");
        this.load.json("wellyBoostData", "wellyBoostData.json");

        this.load.start();
    }

    private loadAudio(): void
    {
        this.load.setPath("./assets/audio/");
        this.load.audio("buttonHovered", "buttonHovered.wav");
        this.load.audio("buttonPressed", "buttonPressed.wav");
    }

    private loadCharacters(): void
    {
        this.load.setPath("./assets/characters/");
        this.load.image("playerFace", "playerFace.png");
        this.load.spritesheet("player", "player.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("Amalia", "Amalia.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyRed", "wellyRed.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyWhite", "wellyWhite.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("wellyItaly", "wellyItaly.png", { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet("boss1", "boss1.png", { frameWidth: 128, frameHeight: 128 });
    }

    private loadTowerDefenseAssets(): void
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
        this.load.image("coin_16", "coin_16.png");
        this.load.image("coin_24", "coin_24.png");
        this.load.image("coin_48", "coin_48.png");
        this.load.image("waveIcon", "waveIcon.png");

        this.load.image("musicIcon", "musicIcon.png");
        this.load.image("musicIconOff", "musicIconOff.png");
        this.load.image("soundIcon", "soundIcon.png");
        this.load.image("soundIconOff", "soundIconOff.png");

        this.load.image("stats_ATQ", "stats_ATQ.png");
        this.load.image("stats_ASP", "stats_ASP.png");
        this.load.image("stats_RNG", "stats_RNG.png");
    }

    private loadWellyBonus():void
    {
        this.load.setPath("./assets/wellyBonus/");
        this.load.image("wellyBonusTemplate", "wellyBonusTemplate.png");
    }

    // Create
    ////////////////////////////////////////////////////////////////////////
  
    public create() : void
    {
        this.input.setDefaultCursor("url(assets/cursors/cursorWellyNormal.cur), pointer");

        new WELLY_LoadingScreen(this);

        this.time.delayedCall(200, () => { this.loadAssets(); }, undefined, this);

        this.load.once(Phaser.Loader.Events.COMPLETE, () => {
            const sceneUI = this.scene.add(WELLY_CST.SCENES.TOWER_DEFENSE_UI, WELLY_SceneTowerDefenseUI, true, undefined) as WELLY_SceneTowerDefenseUI;

            this.scene.add(WELLY_CST.SCENES.TOWER_DEFENSE, WELLY_SceneTowerDefense, true, undefined);
            sceneUI.scene.bringToTop();

            this.scene.remove(WELLY_CST.SCENES.PRELOAD_ASSETS);
        }, this);
    }
}